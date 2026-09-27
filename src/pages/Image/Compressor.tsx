import { useCallback, useEffect, useRef, useState } from "react";

import pica from "pica";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ToolLayout, ToolPanel } from "@/components/tool";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const FORMATS = [
    { value: "image/jpeg", label: "JPEG", ext: "jpg" },
    { value: "image/webp", label: "WEBP", ext: "webp" },
    { value: "image/png", label: "PNG", ext: "png" },
] as const;

const kb = (bytes: number) => (bytes / 1024).toFixed(2);

const ImageCompression = () => {
    const { toast } = useToast();
    const picaInstance = useRef(pica()).current;

    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [originalWidth, setOriginalWidth] = useState(0);
    const [originalHeight, setOriginalHeight] = useState(0);
    const [quality, setQuality] = useState(0.8);
    const [format, setFormat] = useState<string>("image/jpeg");
    const [originalSize, setOriginalSize] = useState(0);
    const [compressedSize, setCompressedSize] = useState(0);
    const [name, setName] = useState("compressed-image");
    const [busy, setBusy] = useState(false);

    // Object URLs are not garbage collected. The previous version created one
    // per compression and never revoked it, so repeatedly compressing a large
    // image leaked the full decoded bitmap each time.
    const revokeCompressed = useCallback(() => {
        setCompressedUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
        setCompressedSize(0);
    }, []);

    useEffect(() => revokeCompressed, [revokeCompressed]);

    useEffect(() => {
        return () => {
            if (originalUrl) URL.revokeObjectURL(originalUrl);
        };
    }, [originalUrl]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        if (!picked) return;

        revokeCompressed();
        setOriginalSize(picked.size);
        setName(picked.name.replace(/\.[^.]+$/, "") || "compressed-image");

        // Keep the select in sync with the uploaded type, but only when we
        // actually support it -- otherwise the Select renders blank.
        const matching = FORMATS.find((f) => f.value === picked.type);
        if (matching) setFormat(matching.value);

        try {
            const bitmap = await createImageBitmap(picked);
            setOriginalWidth(bitmap.width);
            setOriginalHeight(bitmap.height);
            // Reset target size to the source so the tool starts 1:1.
            setWidth(bitmap.width);
            setHeight(bitmap.height);
            bitmap.close();

            setOriginalUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return URL.createObjectURL(picked);
            });
        } catch {
            toast({ title: "Error", description: "Could not read that image.", variant: "destructive" });
        }

        // Allow re-selecting the same file.
        e.target.value = "";
    };

    const handleCompress = async () => {
        if (!originalUrl) return;

        setBusy(true);
        revokeCompressed();

        try {
            const img = new Image();
            img.src = originalUrl;
            await img.decode();

            const source = document.createElement("canvas");
            source.width = img.naturalWidth;
            source.height = img.naturalHeight;
            const ctx = source.getContext("2d");
            if (!ctx) throw new Error("Could not get 2D canvas context");
            ctx.drawImage(img, 0, 0);

            const target = document.createElement("canvas");
            // Guard against 0/NaN from cleared number inputs.
            target.width = width > 0 ? width : img.naturalWidth;
            target.height = height > 0 ? height : img.naturalHeight;

            await picaInstance.resize(source, target);
            const blob = await picaInstance.toBlob(target, format, quality);

            setCompressedUrl(URL.createObjectURL(blob));
            setCompressedSize(blob.size);
        } catch (err) {
            toast({
                title: "Compression failed",
                description: err instanceof Error ? err.message : "Unknown error",
                variant: "destructive",
            });
        } finally {
            setBusy(false);
        }
    };

    const handleDownload = () => {
        if (!compressedUrl) return;
        const ext = FORMATS.find((f) => f.value === format)?.ext ?? "jpg";
        const link = document.createElement("a");
        link.href = compressedUrl;
        link.download = `${name}.${ext}`;
        link.click();
    };

    const saved = originalSize - compressedSize;
    const savedPct = originalSize ? (saved / originalSize) * 100 : 0;

    return (
        <ToolLayout>
            <ToolPanel
                title="Source"
                actions={
                    <Button onClick={handleCompress} disabled={!originalUrl || busy}>
                        {busy ? "Compressing..." : "Compress"}
                    </Button>
                }
            >
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="upload">Upload image</Label>
                        <Input id="upload" type="file" accept="image/*" onChange={handleImageUpload} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="w">Width (px)</Label>
                            <Input
                                id="w" type="number" min={1} inputMode="numeric"
                                value={width || ""} placeholder="Auto"
                                onChange={(e) => { revokeCompressed(); setWidth(Number(e.target.value)); }}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="h">Height (px)</Label>
                            <Input
                                id="h" type="number" min={1} inputMode="numeric"
                                value={height || ""} placeholder="Auto"
                                onChange={(e) => { revokeCompressed(); setHeight(Number(e.target.value)); }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Format</Label>
                        <Select onValueChange={(v) => { revokeCompressed(); setFormat(v); }} value={format}>
                            <SelectTrigger aria-label="Output format"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {FORMATS.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="q">Quality — {quality.toFixed(1)}</Label>
                        <Slider
                            id="q" min={0.1} max={1} step={0.1}
                            value={[quality]}
                            onValueChange={([v]) => { revokeCompressed(); setQuality(v); }}
                            aria-label="Quality"
                        />
                    </div>
                </div>
            </ToolPanel>

            <ToolPanel title="Result">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Figure
                        caption="Original"
                        src={originalUrl}
                        size={originalSize}
                        dims={`${originalWidth} x ${originalHeight}`}
                    />
                    <Figure
                        caption="Compressed"
                        src={compressedUrl}
                        size={compressedSize}
                        dims={compressedUrl ? `${width || originalWidth} x ${height || originalHeight}` : "—"}
                    />
                </div>

                {compressedUrl && (
                    <>
                        <p
                            className={cn(
                                "font-mono text-sm",
                                saved > 0 ? "text-add" : "text-del"
                            )}
                        >
                            {saved > 0 ? "Saved" : "Grew by"} {Math.abs(savedPct).toFixed(2)}% (
                            {kb(Math.abs(saved))} KB)
                        </p>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">File name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <Button onClick={handleDownload} className="w-fit">Download</Button>
                    </>
                )}
            </ToolPanel>
        </ToolLayout>
    );
};

function Figure({
    caption,
    src,
    size,
    dims,
}: {
    caption: string;
    src: string | null;
    size: number;
    dims: string;
}) {
    return (
        <figure className="flex min-w-0 flex-col items-center gap-1.5">
            <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>
            <div className="flex h-[220px] w-full items-center justify-center overflow-hidden rounded-md border bg-muted/30">
                {src ? (
                    <img src={src} alt={caption} className="max-h-full max-w-full object-contain" />
                ) : (
                    <span className="text-xs text-muted-foreground">No image</span>
                )}
            </div>
            <p className="text-center font-mono text-xs break-words">
                {size > 0 ? `${kb(size)} KB` : "—"} · {dims}
            </p>
        </figure>
    );
}

export default ImageCompression;

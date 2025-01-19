import { useState } from "react";
import pica from "pica";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Container,
    Toolbox,
    Panels,
    Panel,
    ImagePreview,
    SizeInfo,
} from "./styled";

const ImageCompression = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [originalFileName, setOriginalFileName] = useState<string>("compressed-image");
    const [compressedImage, setCompressedImage] = useState<string | null>(null);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [quality, setQuality] = useState<number>(0.8);
    const [format, setFormat] = useState<string>("image/jpeg");
    const [originalSize, setOriginalSize] = useState<number>(0);
    const [compressedSize, setCompressedSize] = useState<number>(0);
    const [originalImageWidth, setOriginalImageWidth] = useState<number>(0);
    const [originalImageHeight, setOriginalImageHeight] = useState<number>(0);

    const resetCompressedImage = () => {
        setCompressedImage(null);
        setCompressedSize(0);
    };

    const handleImageUpload = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            resetCompressedImage();
            const fileNameWithoutExtension = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            setOriginalFileName(fileNameWithoutExtension);
            setOriginalSize(file.size);
            const reader = new FileReader();
            reader.onload = (event: any) => {
                setOriginalImage(event.target.result);
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    setWidth(img.width);
                    setHeight(img.height);
                    setOriginalImageWidth(img.width);
                    setOriginalImageHeight(img.height);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePropertyChange = (setter: React.Dispatch<React.SetStateAction<number>>) => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            resetCompressedImage();
            setter(Number(e.target.value));
        };
    };

    const handleFormatChange = (value: string) => {
        resetCompressedImage();
        setFormat(value);
    };

    const handleCompress = async () => {
        if (!originalImage) return;

        const img = new Image();
        img.src = originalImage;

        img.onload = async () => {
            const sourceCanvas = document.createElement("canvas");
            const targetCanvas = document.createElement("canvas");

            sourceCanvas.width = img.width;
            sourceCanvas.height = img.height;

            const ctx: any = sourceCanvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const newWidth = width > 0 ? width : img.width;
            const newHeight = height > 0 ? height : img.height;

            targetCanvas.width = newWidth;
            targetCanvas.height = newHeight;

            const picaInstance = pica();
            await picaInstance.resize(sourceCanvas, targetCanvas);
            const blob = await picaInstance.toBlob(targetCanvas, format, quality);

            const compressedImageUrl: any = URL.createObjectURL(blob);
            setCompressedImage(compressedImageUrl);
            setCompressedSize(blob.size);
        };
    };

    const handleDownload = () => {
        if (compressedImage) {
            const link = document.createElement("a");
            link.href = compressedImage;
            link.download = `${originalFileName}.${format.split("/")[1]}`;
            link.click();
        }
    };

    const sizeSaving = originalSize - compressedSize;
    const savingPercentage = originalSize
        ? ((sizeSaving / originalSize) * 100).toFixed(2)
        : "0.00";
    const isSavingPositive = sizeSaving > 0;

    return (
        <Container>
            <Toolbox>
                <div>
                    <label>Upload Image</label>
                    <Input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
                <div>
                    <label>Width (px)</label>
                    <Input
                        type="number"
                        placeholder="Width"
                        value={width}
                        onChange={handlePropertyChange(setWidth)}
                    />
                </div>
                <div>
                    <label>Height (px)</label>
                    <Input
                        type="number"
                        placeholder="Height"
                        value={height}
                        onChange={handlePropertyChange(setHeight)}
                    />
                </div>
                <div>
                    <label>Format</label>
                    <Select onValueChange={(value) => handleFormatChange(value)} value={format}>
                        <SelectTrigger>
                            <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="image/jpeg">JPEG</SelectItem>
                            <SelectItem value="image/png">PNG</SelectItem>
                            <SelectItem value="image/webp">WEBP</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label>Quality (0.1 - 1.0)</label>
                    <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="1.0"
                        placeholder="Quality"
                        value={quality}
                        onChange={(e) => {
                            resetCompressedImage();
                            setQuality(Number(e.target.value));
                        }}
                    />
                </div>
                <Button onClick={handleCompress}>Compress</Button>
            </Toolbox>

            <Panels>
                <Panel>
                    <h3>Original Image</h3>
                    {originalImage && <ImagePreview src={originalImage} alt="Original" />}
                    <p>Original Size: {(originalSize / 1024).toFixed(2)} KB</p>
                    <p>
                        Original Dimension: {originalImageWidth} x {originalImageHeight}
                    </p>
                </Panel>

                <Panel>
                    <h3>Compressed Image</h3>
                    {compressedImage && (
                        <>
                            <ImagePreview src={compressedImage} alt="Compressed" />
                            <p>Compressed Size: {(compressedSize / 1024).toFixed(2)} KB</p>
                            <p>
                                Compressed Dimension: {width} x {height}
                            </p>
                            <SizeInfo isSavingPositive={isSavingPositive}>
                                Size Saving: {savingPercentage}%
                            </SizeInfo>
                            <Input
                                type="text"
                                placeholder="File name"
                                value={originalFileName}
                                onChange={(e) => setOriginalFileName(e.target.value)}
                            />
                            <Button onClick={handleDownload}>Download</Button>
                        </>
                    )}
                </Panel>
            </Panels>
        </Container>
    );
};

export default ImageCompression;

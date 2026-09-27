import { Route, Routes } from 'react-router'
import { Toaster } from "@/components/ui/toaster"
import { Suspense, lazy } from "react";

import Home from './pages/Home'
import ToolBar from './layout/ToolBar'
import { SkeletonCard } from './components/CardLoader';
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardHelp } from "@/components/keyboard-help";

const JSONDiff = lazy(() => import('./pages/JSON/Diff'))
const JSONPrettyPrint = lazy(() => import('./pages/JSON/PrettyPrint'))
const Base64Encode = lazy(() => import('./pages/base64/Encode'))
const Base64Decode = lazy(() => import('./pages/base64/Decode'))
const URIEncode = lazy(() => import('./pages/URI/Encode'))
const URIDecode = lazy(() => import('./pages/URI/Decode'))
const TextLineDiff = lazy(() => import('./pages/Text/LineDiff'))
const TextCharDiff = lazy(() => import('./pages/Text/CharDiff'))
const DateTimezone = lazy(() => import('./pages/Date/Timezone'));
const DateEpoch = lazy(() => import('./pages/Date/Epoch'));
const ColorPicker = lazy(() => import('./pages/Colors/Picker'));
const ImageCompressor = lazy(() => import('./pages/Image/Compressor'));
const YamlViz = lazy(() => import('./pages/YamlViz'));
const TodoList = lazy(() => import('./pages/Productivity/TodoList'))
const Hash = lazy(() => import('./pages/Text/Hash'))
const Cron = lazy(() => import('./pages/Dev/Cron'))
const JwtDecoder = lazy(() => import('./pages/Dev/Jwt'))
const Semver = lazy(() => import('./pages/Dev/Semver'))
const BaseConverter = lazy(() => import('./pages/Dev/BaseConverter'))
const IdGenerator = lazy(() => import('./pages/Dev/IdGenerator'))
const ChmodCalc = lazy(() => import('./pages/Dev/ChmodCalc'))
const CaseConverter = lazy(() => import('./pages/Text/CaseConverter'))
const RegexTester = lazy(() => import('./pages/Text/RegexTester'))
const Toml = lazy(() => import('./pages/Text/Toml'))
const MimeLookup = lazy(() => import('./pages/Text/MimeLookup'));

// Providers (theme, command palette) are mounted in main.tsx, above this
// component, so the shortcuts below can actually read them.
function App() {
  useKeyboardShortcuts();

  return (
    <ToolBar>
      <Suspense fallback={<SkeletonCard />}>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/json-diff" element={<JSONDiff />} />
          <Route path="/json-pp" element={<JSONPrettyPrint />} />
          <Route path="/b64-encode" element={<Base64Encode />} />
          <Route path="/b64-decode" element={<Base64Decode />} />
          <Route path="/uri-encode" element={<URIEncode />} />
          <Route path="/uri-decode" element={<URIDecode />} />
          <Route path="/txt-diff-line" element={<TextLineDiff />} />
          <Route path="/txt-diff-char" element={<TextCharDiff />} />
          <Route path="/date-tz" element={<DateTimezone />} />
          <Route path="/date-epoch" element={<DateEpoch />} />
          <Route path="/color-picker" element={<ColorPicker />} />
          <Route path="/img-compressor" element={<ImageCompressor />} />
          <Route path="/yaml-viz" element={<YamlViz />} />
          <Route path="/todo-list" element={<TodoList />} />
          <Route path="/hash" element={<Hash />} />
          <Route path="/cron" element={<Cron />} />
          <Route path="/jwt" element={<JwtDecoder />} />
          <Route path="/semver" element={<Semver />} />
          <Route path="/base-converter" element={<BaseConverter />} />
          <Route path="/id-generator" element={<IdGenerator />} />
          <Route path="/chmod" element={<ChmodCalc />} />
          <Route path="/case-converter" element={<CaseConverter />} />
          <Route path="/regex-tester" element={<RegexTester />} />
          <Route path="/toml" element={<Toml />} />
          <Route path="/mime" element={<MimeLookup />} />
        </Routes>
      </Suspense>
      <Toaster />
      <KeyboardHelp />
    </ToolBar>
  )
}

export default App

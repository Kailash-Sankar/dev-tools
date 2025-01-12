import './App.css'
import { Route, Routes } from 'react-router'
import { Toaster } from "@/components/ui/toaster"
import { Suspense, lazy } from "react";

import Home from './pages/Home'
import { ThemeProvider } from "@/components/theme-provider"
import ToolBar from './layout/ToolBar'
import { ContentWrapper } from './layout/styled'
import { SkeletonCard } from './components/CardLoader';
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

function App() {
  return (
    <div>
      <ThemeProvider>
        <ToolBar>
          <ContentWrapper>
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
              </Routes>
            </Suspense>
          </ContentWrapper>
          <Toaster />
        </ToolBar>
      </ThemeProvider>
    </div>
  )
}

export default App

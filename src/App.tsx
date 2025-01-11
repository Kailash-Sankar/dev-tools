import './App.css'
import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import JSONDiff from './pages/JSON/Diff'
import JSONPrettyPrint from './pages/JSON/PrettyPrint'
import { ThemeProvider } from "@/components/theme-provider"
import ToolBar from './layout/ToolBar'
import { ContentWrapper } from './layout/styled'
import Base64Encode from './pages/base64/Encode'
import Base64Decode from './pages/base64/Decode'
import URIEncode from './pages/URI/Encode'
import URIDecode from './pages/URI/Decode'
import TextLineDiff from './pages/Text/LineDiff'
import TextCharDiff from './pages/Text/CharDiff'
import DateTimezone from './pages/Date/Timezone'
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <div>
      <ThemeProvider>
        <ToolBar>
          <ContentWrapper>
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
            </Routes>
          </ContentWrapper>
          <Toaster />
        </ToolBar>
      </ThemeProvider>
    </div>
  )
}

export default App

import './App.css'
import { Route, Routes } from 'react-router'
import Home from './pages/Home'
import JSONDiff from './pages/JSON/JSONDiff'
import JSONPrettyPrint from './pages/JSON/JSONPrettyPrint'
import { ThemeProvider } from "@/components/theme-provider"
import ToolBar from './layout/ToolBar'
import { ContentWrapper } from './layout/styled'
import Base64Encode from './pages/base64/encode'
import Base64Decode from './pages/base64/decode'

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
            </Routes>
          </ContentWrapper>
        </ToolBar>
      </ThemeProvider>
    </div>
  )
}

export default App

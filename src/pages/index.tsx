import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Pages: React.FC<{}> = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<></>}></Route>
    </Routes>
  </BrowserRouter>
)

export default Pages

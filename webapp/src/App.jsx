import { HashRouter, Routes, Route, useParams } from 'react-router-dom'
import Shell from './components/layout/Shell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ChapterPage from './pages/ChapterPage.jsx'
import SectionPage from './pages/SectionPage.jsx'
import Workflows from './pages/Workflows.jsx'
import WorkflowRunner from './pages/WorkflowRunner.jsx'
import Cookbook from './pages/Cookbook.jsx'
import Glossary from './pages/Glossary.jsx'
import Playground from './pages/Playground.jsx'

// Remount SectionPage whenever the section changes — its step index, resume
// prompt, and quiz state must never leak from one section into the next.
function KeyedSectionPage() {
  const { chId, secId } = useParams()
  return <SectionPage key={`${chId}/${secId}`} />
}

function App() {
  return (
    <HashRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chapter/:chId" element={<ChapterPage />} />
          <Route path="/chapter/:chId/:secId" element={<KeyedSectionPage />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/workflows/:wfId" element={<WorkflowRunner />} />
          <Route path="/cookbook" element={<Cookbook />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/playground" element={<Playground />} />
        </Routes>
      </Shell>
    </HashRouter>
  )
}

export default App

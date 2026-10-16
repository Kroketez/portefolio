import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminContent from './admin/AdminContent'
import AdminLayout, { Login } from './admin/AdminLayout'
import { AdminMessages, AdminStats } from './admin/AdminMessages'
import AdminProjects from './admin/AdminProjects'
import Dashboard from './admin/Dashboard'
import Layout from './components/Layout'
import { AppProvider } from './lib/app'
import About from './pages/About'
import Contact, { NotFound } from './pages/Contact'
import Cv from './pages/Cv'
import Home from './pages/Home'
import ProjectDetail from './pages/ProjectDetail'
import Projects from './pages/Projects'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/projetos" element={<Projects />} />
            <Route path="/projetos/:slug" element={<ProjectDetail />} />
            <Route path="/cv" element={<Cv />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projetos" element={<AdminProjects />} />
            <Route path="conteudos" element={<AdminContent />} />
            <Route path="contactos" element={<AdminMessages />} />
            <Route path="estatisticas" element={<AdminStats />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

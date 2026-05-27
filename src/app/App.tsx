import { Navigate, Route, Routes } from 'react-router-dom';
import { StudioLayout } from '../studio/layout/StudioLayout';
import { StartupScreen } from '../studio/startup/StartupScreen';
import { DocsViewer } from '../docs-viewer/DocsViewer';
import { useAppState } from './state/useAppState';

export default function App() {
  const hasProject = useAppState((s) => !!s.currentProject);

  return (
    <Routes>
      <Route path="/" element={hasProject ? <Navigate to="/studio" replace /> : <StartupScreen />} />
      <Route path="/studio" element={hasProject ? <StudioLayout /> : <Navigate to="/" replace />} />
      <Route path="/docs/:docId" element={<DocsViewer />} />
      <Route path="*" element={<Navigate to={hasProject ? '/studio' : '/'} replace />} />
    </Routes>
  );
}


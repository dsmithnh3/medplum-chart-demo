// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { AppShell, ErrorBoundary, Loading, Logo, useMedplum, useMedplumProfile } from '@medplum/react';
import {
  IconClipboardHeart,
  IconClipboardList,
  IconDatabaseImport,
  IconHealthRecognition,
  IconQuestionMark,
  IconRobot,
  IconUser,
} from '@tabler/icons-react';
import { lazy, Suspense } from 'react';
import type { JSX } from 'react';
import { Route, Routes } from 'react-router';

// Code-split routes for better performance
const EncounterPage = lazy(() => import('./pages/EncounterPage').then((m) => ({ default: m.EncounterPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const PatientPage = lazy(() => import('./pages/PatientPage').then((m) => ({ default: m.PatientPage })));
const ResourcePage = lazy(() => import('./pages/ResourcePage').then((m) => ({ default: m.ResourcePage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const SignInPage = lazy(() => import('./pages/SignInPage').then((m) => ({ default: m.SignInPage })));
const UploadDataPage = lazy(() => import('./pages/UploadDataPage').then((m) => ({ default: m.UploadDataPage })));

// Import analytics hook
import { usePageTracking } from './hooks/usePageTracking';

export function App(): JSX.Element | null {
  const medplum = useMedplum();
  const profile = useMedplumProfile();

  // Track page views automatically
  usePageTracking();

  if (medplum.isLoading()) {
    return null;
  }

  return (
    <AppShell
      logo={<Logo size={24} />}
      menus={[
        {
          title: 'Charts',
          links: [{ icon: <IconUser />, label: 'Patients', href: '/Patient' }],
        },
        {
          title: 'Encounters',
          links: [
            { icon: <IconClipboardList />, label: 'All Encounters', href: '/Encounter' },
            {
              icon: <IconClipboardHeart />,
              label: 'My Encounters',
              href: `/Encounter?participant=Practitioner/${profile?.id}`,
            },
          ],
        },
        {
          title: 'Upload Data',
          links: [
            { icon: <IconDatabaseImport />, label: 'Upload Core ValueSets', href: '/upload/core' },
            { icon: <IconQuestionMark />, label: 'Upload Questionnaires', href: '/upload/questionnaire' },
            { icon: <IconRobot />, label: 'Upload Example Bots', href: '/upload/bots' },
            { icon: <IconHealthRecognition />, label: 'Upload Example Patient Data', href: '/upload/example' },
          ],
        },
      ]}
    >
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={profile ? <SearchPage /> : <LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/Patient/:id">
              <Route index element={<PatientPage />} />
              <Route path="*" element={<PatientPage />} />
            </Route>
            <Route path="/:resourceType/:id">
              <Route index element={<ResourcePage />} />
              <Route path="*" element={<ResourcePage />} />
            </Route>
            <Route path="/:resourceType" element={<SearchPage />} />
            <Route path="/Encounter/:id">
              <Route index element={<EncounterPage />} />
              <Route path="*" element={<EncounterPage />} />
            </Route>
            <Route path="/upload/:dataType" element={<UploadDataPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}

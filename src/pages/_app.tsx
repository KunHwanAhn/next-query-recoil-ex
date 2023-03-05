import React, { useState } from 'react';
import type { AppProps } from 'next/app';
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
  DehydratedState,
} from 'react-query';

import '@/styles/globals.scss';

import DefaultLayout from '@/components/DefaultLayout';

export type CustomPageProps = {
  dehydratedState: DehydratedState
};
export default function App({ Component, pageProps }: AppProps<CustomPageProps>) {
  const [queryClient] = useState(() => new QueryClient());
  const { dehydratedState, ...restPageProps } = pageProps;

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={dehydratedState}>
        <DefaultLayout>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...restPageProps} />
        </DefaultLayout>
      </Hydrate>
    </QueryClientProvider>
  );
}

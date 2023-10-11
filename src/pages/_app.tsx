import '@/styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RefreshTokenHandler from '@/components/refreshTokenHandler'; 
import { Inter } from 'next/font/google'
import Header from '@/components/header';
import ILine from '@/interfaces/line';

type WorkingContextType = {
  isWorking: boolean, 
  currentLine: ILine | undefined, 
  setIsWorking: Dispatch<boolean>, 
  setCurrentLine: Dispatch<SetStateAction<ILine | undefined>>
}

const inter = Inter({subsets: ['vietnamese']})
const WorkingContext = createContext({} as WorkingContextType)
export const useGlobalContext = () => useContext(WorkingContext)

export default function App({ Component, pageProps }: AppProps) {
  const [interval, setInterval] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [currentLine, setCurrentLine] = useState<ILine | undefined>(undefined);

  return <WorkingContext.Provider value={{ isWorking, currentLine, setIsWorking, setCurrentLine }}><SessionProvider session={pageProps.session} refetchInterval={interval}>
    <Head>
      <title>Santomas</title>
    </Head>
    <Header/>
    <main className={inter.className + ' lg:p-7 text-neutral-800'}>
      <Component {...pageProps} />
    </main>
    <ToastContainer 
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover={false}
      theme="light"
    />
    <RefreshTokenHandler setInterval={setInterval} />
  </SessionProvider></WorkingContext.Provider>
  }

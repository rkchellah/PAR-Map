import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Custom404() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/map')
    }, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Manrope, sans-serif',
      color: '#003461',
      background: '#f8f9fa'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f4f5',
        borderTop: '4px solid #003461',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }} />
      <h1 style={{ fontSize: '18px', fontWeight: 700 }}>Redirecting...</h1>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

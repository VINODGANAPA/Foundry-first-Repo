import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, Html, Float } from '@react-three/drei'
import { useMemo, useState } from 'react'
import axios from 'axios'
import './App.css'

function Sperm({ count = 50 }) {
  const positions = useMemo(() => {
    return new Array(count).fill(0).map(() => [
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 6,
    ])
  }, [count])
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#9ad0ff" emissive="#0a3a6a" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function Embryo() {
  return (
    <group>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
        <Sphere args={[1.2, 32, 32]}>
          <meshStandardMaterial color="#ffd6e7" roughness={0.5} metalness={0.1} />
        </Sphere>
      </Float>
      <Sperm count={90} />
    </group>
  )
}

function IVFScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} style={{ height: 380, borderRadius: 12 }}>
      <color attach="background" args={[0.02, 0.02, 0.06]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Embryo />
      <Html position={[0, 2.1, 0]} center>
        <div style={{ background: 'rgba(0,0,0,0.45)', padding: '6px 10px', borderRadius: 8, fontSize: 12 }}>
          Fertilization ➝ Cleavage ➝ Blastocyst ➝ Transfer ➝ Gestation
        </div>
      </Html>
      <OrbitControls enablePan={false} />
    </Canvas>
  )
}

function BookingForm() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', preferred_date: '', preferred_time: '', reason: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      await axios.post('/api/appointments', form)
      setMessage('Appointment request received. We will contact you shortly.')
      setForm({ full_name: '', email: '', phone: '', preferred_date: '', preferred_time: '', reason: '' })
    } catch (err) {
      setMessage('There was a problem submitting your request. Please check your inputs.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>Full name</label>
        <input name="full_name" value={form.full_name} onChange={handleChange} required minLength={2} placeholder="Jane Doe" />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jane@example.com" />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 123 4567" />
      </div>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <label>Preferred date</label>
          <input type="date" name="preferred_date" value={form.preferred_date} onChange={handleChange} required />
        </div>
        <div>
          <label>Preferred time</label>
          <input type="time" name="preferred_time" value={form.preferred_time} onChange={handleChange} required />
        </div>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>Reason / Notes</label>
        <textarea name="reason" value={form.reason} onChange={handleChange} rows={4} placeholder="Optional" />
      </div>
      <button disabled={submitting} type="submit">{submitting ? 'Submitting...' : 'Book appointment'}</button>
      {message && <p style={{ margin: 0 }}>{message}</p>}
    </form>
  )
}

function App() {
  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 980, margin: '0 auto', padding: 24 }}>
      <header style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: 8 }}>IVF Clinic</h1>
        <p style={{ marginTop: 0, color: '#9aa0a6' }}>Compassionate fertility care. Learn the IVF journey then book your visit.</p>
      </header>
      <section>
        <IVFScene />
      </section>
      <section style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Book an appointment</h2>
        <BookingForm />
      </section>
    </div>
  )
}

export default App

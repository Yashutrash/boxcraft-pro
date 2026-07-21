import React from 'react';
import Link from 'next/link';
import { useBoxStore } from '../src/lib/useBoxStore';
import Box3DViewer from '../src/components/Box3DViewer';

export default function Dielines() {
  const setBoxModel = useBoxStore((state) => state.setBoxModel);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#fdfbf7', // Warm paper background
      fontFamily: "Georgia, 'Times New Roman', serif",
      color: '#3a2e26' // Deep warm brown
    }}>
      {/* Sidebar Navigation */}
      <div style={{
        width: '260px',
        borderRight: '1px solid rgba(58, 46, 38, 0.15)',
        padding: '24px 16px',
        flexShrink: 0,
        backgroundColor: '#fdfbf7',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', cursor: 'pointer', fontWeight: '600', color: '#3a2e26' }}>
            By Uses
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', cursor: 'pointer', fontWeight: '600', color: '#3a2e26' }}>
            By Models
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
          </div>
          
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ padding: '10px 12px', border: '2px solid #3a2e26', borderRadius: '15px 8px 12px 18px', fontWeight: '600', display: 'flex', justifyContent: 'space-between', backgroundColor: '#a9b396', color: '#3a2e26' }}>
              <span># All</span>
              <span style={{ color: '#3a2e26', fontSize: '12px' }}>4</span>
            </div>
            
            {[
              { name: '# Tuck End Boxes', count: 4 }
            ].map((item) => (
              <div key={item.name} style={{ padding: '8px 12px', color: '#7a6a5f', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderRadius: '15px 8px 12px 18px', transition: 'all 0.2s' }} 
                   onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(169, 179, 150, 0.25)'; e.currentTarget.style.color = '#3a2e26'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#7a6a5f'; }}>
                <span>{item.name}</span>
                <span style={{ color: '#7a6a5f', fontSize: '12px' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* Top Nav with Back Button */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/">
            <button style={{
              background: '#d48c70', // Terracotta
              border: '2px solid #3a2e26',
              color: '#fdfbf7',
              padding: '8px 20px',
              borderRadius: '20px 10px 15px 20px',
              fontSize: '14px', fontWeight: '600',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '2px 3px 0px #3a2e26',
              transform: 'rotate(-1deg)',
              transition: 'transform 0.2s, boxShadow 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) rotate(-1deg)'; e.currentTarget.style.boxShadow = '4px 5px 0px #3a2e26'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px) rotate(-1deg)'; e.currentTarget.style.boxShadow = '2px 3px 0px #3a2e26'; }}
            >
              ← Back to Main Page
            </button>
          </Link>
        </div>

        {/* Header Container */}
        <div style={{
          maxWidth: '1200px',
          backgroundColor: '#fffcf7',
          borderRadius: '30px 20px 40px 25px', // Organic shape
          padding: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          border: '2px solid #3a2e26',
          boxShadow: '6px 8px 0px rgba(212,140,112,0.3)'
        }}>
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2', color: '#3a2e26' }}>
              <span style={{ color: '#d48c70', display: 'inline-flex', alignItems: 'center', marginRight: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </span> 
              Premium Box Templates
            </h1>
            <p style={{ fontSize: '16px', color: '#7a6a5f', marginBottom: '32px', lineHeight: '1.6', fontFamily: "'Inter', sans-serif" }}>
              Design beautiful, organic packaging that stands out.<br/>
              BoxCraft's parametric library gives you complete creative control.
            </p>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <input 
                type="text" 
                placeholder="Search styles..." 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingLeft: '44px',
                  borderRadius: '16px 8px 14px 20px',
                  border: '2px solid #3a2e26',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  fontFamily: "'Inter', sans-serif"
                }}
              />
              <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#7a6a5f' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
          
          {/* Right side illustration matching the image */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative', fontFamily: "'Inter', sans-serif" }}>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
               {/* H/W/L Inputs like in the image */}
              <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(212,140,112,0.15)', padding: '4px 8px', borderRadius: '10px', border: '1px solid #d48c70' }}>
                  <span style={{ color: '#d48c70', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>H</span>
                  <span style={{ color: '#d48c70', fontSize: '10px' }}>mm</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '4px 8px', borderRadius: '10px', border: '1px solid rgba(58, 46, 38, 0.15)' }}>
                  <span style={{ color: '#7a6a5f', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>L 75</span>
                  <span style={{ color: '#a89f91', fontSize: '10px' }}>mm</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '4px 8px', borderRadius: '10px', border: '1px solid rgba(58, 46, 38, 0.15)' }}>
                  <span style={{ color: '#7a6a5f', fontSize: '12px', fontWeight: '600', marginRight: '8px' }}>W 60</span>
                  <span style={{ color: '#a89f91', fontSize: '10px' }}>mm</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', width: '350px', height: '200px' }}>
              <svg width="100%" height="100%" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 30 L50 130 L100 130 L100 30 Z" stroke="#a9b396" strokeWidth="2" />
                <path d="M100 30 L100 130 L200 130 L200 30 Z" stroke="#d48c70" strokeWidth="2" />
                <path d="M200 30 L200 130 L250 130 L250 30 Z" stroke="#e8dfd5" strokeWidth="2" />
                <path d="M100 10 L100 30 L200 30 L200 10 Z" stroke="#d48c70" strokeWidth="2" />
                <path d="M50 30 L50 15 L70 15" stroke="#a9b396" strokeWidth="2" />
                <path d="M200 30 L200 15 L180 15" stroke="#d48c70" strokeWidth="2" />
                <text x="30" y="80" fontSize="10" fill="#7a6a5f">80mm</text>
                <line x1="45" y1="30" x2="45" y2="130" stroke="#a89f91" strokeWidth="1" strokeDasharray="2,2" />
                <polygon points="45,30 42,35 48,35" fill="#a89f91" />
                <polygon points="45,130 42,125 48,125" fill="#a89f91" />
              </svg>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div style={{ maxWidth: '1200px' }}>
          <h2 style={{ fontSize: '16px', color: '#7a6a5f', marginBottom: '24px', fontWeight: '600', fontFamily: "'Inter', sans-serif" }}>4 Dielines</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Card 1: Rollover hinged lid mailer box dieline */}
            <Link href="/dieline" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ cursor: 'pointer' }}>
                <div style={{
                  backgroundColor: '#fffcf7',
                  borderRadius: '24px 16px 20px 24px',
                  padding: '20px',
                  border: '2px solid #3a2e26',
                  display: 'flex',
                  justifyContent: 'space-between',
                  height: '220px',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '4px 5px 0px rgba(58, 46, 38, 0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '6px 8px 0px rgba(212, 140, 112, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '4px 5px 0px rgba(58, 46, 38, 0.15)';
                }}
                >
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', fontFamily: "'Inter', sans-serif" }}>
                    <span style={{ fontSize: '10px', background: '#e8dfd5', color: '#3a2e26', padding: '4px 8px', borderRadius: '8px 4px 6px 8px', fontWeight: '600' }}>Printable</span>
                    <span style={{ fontSize: '10px', background: '#a9b396', color: '#3a2e26', padding: '4px 8px', borderRadius: '8px 4px 6px 8px', fontWeight: '600' }}>Downloadable</span>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: '8px', marginTop: '16px' }}>
                    <svg width="120" height="150" viewBox="0 0 100 120" fill="none" stroke="#d48c70" strokeWidth="1.5">
                       <rect x="20" y="20" width="60" height="80" fill="rgba(212,140,112,0.05)" />
                       <rect x="20" y="20" width="60" height="20" stroke="#e74c3c" strokeDasharray="2,2" />
                       <rect x="10" y="40" width="10" height="40" />
                       <rect x="80" y="40" width="10" height="40" />
                    </svg>
                  </div>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '8px', marginTop: '16px' }}>
                     <div style={{ width: '70px', height: '40px', backgroundColor: '#e8dfd5', position: 'relative', border: '1px solid #3a2e26', transform: 'skewX(-10deg)' }}>
                       <div style={{ position: 'absolute', bottom: '100%', left: -1, width: '100%', height: '30px', backgroundColor: '#d48c70', transform: 'skewX(-30deg)', transformOrigin: 'bottom left', border: '1px solid #3a2e26' }}></div>
                     </div>
                  </div>
                </div>
                <h3 style={{ fontSize: '15px', color: '#3a2e26', marginTop: '16px', textAlign: 'left', fontWeight: '600', fontFamily: "'Inter', sans-serif" }}>Rollover hinged lid mailer box</h3>
              </div>
            </Link>

            {/* Card 2: Reverse tuck end box dieline */}
            <Link href="/dieline" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setBoxModel('rte')}>
              <div style={{ cursor: 'pointer' }}>
                <div style={{
                  backgroundColor: '#fffcf7',
                  borderRadius: '24px 16px 20px 24px',
                  padding: '20px',
                  border: '2px solid #3a2e26',
                  display: 'flex',
                  justifyContent: 'space-between',
                  height: '220px',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '4px 5px 0px rgba(58, 46, 38, 0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '6px 8px 0px rgba(212, 140, 112, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '4px 5px 0px rgba(58, 46, 38, 0.15)';
                }}
                >
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', fontFamily: "'Inter', sans-serif" }}>
                    <span style={{ fontSize: '10px', background: '#e8dfd5', color: '#3a2e26', padding: '4px 8px', borderRadius: '8px 4px 6px 8px', fontWeight: '600' }}>Printable</span>
                    <span style={{ fontSize: '10px', background: '#a9b396', color: '#3a2e26', padding: '4px 8px', borderRadius: '8px 4px 6px 8px', fontWeight: '600' }}>Downloadable</span>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: '8px', marginTop: '16px' }}>
                    <svg width="120" height="150" viewBox="0 0 100 120" fill="none" stroke="#d48c70" strokeWidth="1.5">
                      <rect x="25" y="40" width="50" height="40" fill="rgba(212, 140, 112, 0.05)" />
                      <rect x="25" y="20" width="50" height="20" stroke="#e74c3c" strokeDasharray="2,2" />
                      <rect x="25" y="80" width="50" height="20" />
                      <path d="M25 20 L25 10 L75 10 L75 20" stroke="#e74c3c" />
                      <path d="M25 100 L25 110 L75 110 L75 100" />
                      <rect x="5" y="40" width="20" height="40" />
                      <rect x="75" y="40" width="20" height="40" />
                    </svg>
                  </div>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '8px', marginTop: '16px' }}>
                     <div style={{ width: '100%', height: '140px', position: 'relative', pointerEvents: 'none' }}>
                       <Box3DViewer 
                         L={60} W={40} H={100} T={0.015} 
                         progress={1} 
                         materialPreset="white-kraft"
                         lightingPreset="studio"
                         decals={[]}
                         boxModelOverride="rte"
                       />
                     </div>
                  </div>
                </div>
                <h3 style={{ fontSize: '15px', color: '#3a2e26', marginTop: '16px', textAlign: 'left', fontWeight: '600', fontFamily: "'Inter', sans-serif" }}>Reverse tuck end box</h3>
              </div>
            </Link>

            {/* Card 3: Tuck end mailer box packaging dieline */}
            <Link href="/dieline" style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => setBoxModel('te')}>
              <div style={{ cursor: 'pointer' }}>
                <div style={{
                  backgroundColor: '#fffcf7',
                  borderRadius: '24px 16px 20px 24px',
                  padding: '20px',
                  border: '2px solid #3a2e26',
                  display: 'flex',
                  justifyContent: 'space-between',
                  height: '220px',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '4px 5px 0px rgba(58, 46, 38, 0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '6px 8px 0px rgba(212, 140, 112, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '4px 5px 0px rgba(58, 46, 38, 0.15)';
                }}
                >
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', fontFamily: "'Inter', sans-serif" }}>
                    <span style={{ fontSize: '10px', background: '#e8dfd5', color: '#3a2e26', padding: '4px 8px', borderRadius: '8px 4px 6px 8px', fontWeight: '600' }}>Printable</span>
                    <span style={{ fontSize: '10px', background: '#a9b396', color: '#3a2e26', padding: '4px 8px', borderRadius: '8px 4px 6px 8px', fontWeight: '600' }}>Downloadable</span>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: '8px', marginTop: '16px' }}>
                    <svg width="120" height="150" viewBox="0 0 100 120" fill="none" stroke="#d48c70" strokeWidth="1.5">
                      <rect x="25" y="40" width="50" height="40" fill="rgba(212, 140, 112, 0.05)" />
                      <rect x="25" y="20" width="50" height="20" stroke="#e74c3c" strokeDasharray="2,2" />
                      <rect x="25" y="80" width="50" height="20" stroke="#e74c3c" strokeDasharray="2,2" />
                      <path d="M25 20 L25 10 L75 10 L75 20" stroke="#e74c3c" />
                      <path d="M25 100 L25 110 L75 110 L75 100" />
                      <rect x="5" y="40" width="20" height="40" />
                      <rect x="75" y="40" width="20" height="40" />
                    </svg>
                  </div>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '8px', marginTop: '16px' }}>
                     <div style={{ width: '100%', height: '140px', position: 'relative', pointerEvents: 'none' }}>
                       <Box3DViewer 
                         L={60} W={40} H={100} T={0.015} 
                         progress={1} 
                         materialPreset="white-kraft"
                         lightingPreset="studio"
                         decals={[]}
                         boxModelOverride="te"
                       />
                     </div>
                  </div>
                </div>
                <h3 style={{ fontSize: '15px', color: '#3a2e26', marginTop: '16px', textAlign: 'left', fontWeight: '600', fontFamily: "'Inter', sans-serif" }}>Tuck end box</h3>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}

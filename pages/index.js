import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fdfbf7', // Warm paper/cream background
      color: '#3a2e26',           // Deep warm brown
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Organic Background Blobs / Hand-painted vibe */}
      <div style={{
        position: 'absolute',
        top: '-10%', left: '-10%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(212,140,112,0.15) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none', borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%', right: '-5%', width: '800px', height: '800px',
        background: 'radial-gradient(circle, rgba(169,179,150,0.15) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none', borderRadius: '50%'
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 48px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Hand-drawn style Logo */}
          <div style={{
            width: '40px', height: '40px',
            backgroundColor: '#d48c70', // Terracotta
            borderRadius: '14px 8px 12px 18px', // Organic shape
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '22px', color: '#fdfbf7',
            transform: 'rotate(-4deg)',
            boxShadow: '3px 4px 0px rgba(58,46,38,0.1)'
          }}>B</div>
          <span style={{ 
            fontSize: '22px', fontWeight: '700', 
            fontFamily: "Georgia, 'Times New Roman', serif",
            letterSpacing: '-0.5px'
          }}>BoxCraft Pro</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button style={{
            background: 'transparent',
            border: 'none', color: '#7a6a5f',
            fontSize: '15px', fontWeight: '500', cursor: 'pointer'
          }}>Our Story</button>
          
          {/* Hand-painted style button */}
          <button style={{
            background: '#a9b396', // Sage green
            border: '2px solid #3a2e26',
            color: '#3a2e26',
            padding: '10px 24px',
            borderRadius: '25px 15px 20px 25px', // Organic shape
            fontSize: '15px', fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '3px 4px 0px #3a2e26',
            transform: 'rotate(2deg)',
            transition: 'transform 0.2s, boxShadow 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) rotate(2deg)'; e.currentTarget.style.boxShadow = '5px 6px 0px #3a2e26'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px) rotate(2deg)'; e.currentTarget.style.boxShadow = '3px 4px 0px #3a2e26'; }}
          >
            Start Designing
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '80px', textAlign: 'center',
        maxWidth: '1200px', margin: '0 auto'
      }}>
        
        {/* Story-First Hero Section */}
        <h1 style={{
          fontSize: '56px', fontWeight: '400', lineHeight: '1.1',
          marginBottom: '24px', maxWidth: '700px',
          fontFamily: "Georgia, 'Times New Roman', serif",
          color: '#3a2e26'
        }}>
          Bring your packaging stories to <span style={{ 
            color: '#d48c70', fontStyle: 'italic', paddingRight: '8px'
          }}>life.</span>
        </h1>
        
        <p style={{
          fontSize: '20px', color: '#7a6a5f',
          maxWidth: '560px', marginBottom: '80px', lineHeight: '1.7',
          fontWeight: '400'
        }}>
          A warm, unified space where your ideas unfold gently. Design, visualize, and create beautiful print-ready dielines without the rigid complexity.
        </p>

        {/* Hand-crafted Cards Container */}
        <div style={{
          display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap'
        }}>
          
          {/* 3D Workspace Card */}
          <Link href="/mockups" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '340px', height: '360px',
              backgroundColor: '#fffcf7', // Slightly lighter cream
              border: '2px solid #3a2e26',
              borderRadius: '20px 30px 15px 25px', // Imperfect
              padding: '36px',
              display: 'flex', flexDirection: 'column',
              cursor: 'pointer',
              boxShadow: '6px 8px 0px rgba(58,46,38,0.15)',
              transform: 'rotate(-2deg)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.transform = 'translateY(-6px) rotate(-1deg)'; 
              e.currentTarget.style.boxShadow = '8px 12px 0px rgba(212,140,112,0.3)';
              e.currentTarget.style.borderColor = '#d48c70';
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.transform = 'rotate(-2deg)'; 
              e.currentTarget.style.boxShadow = '6px 8px 0px rgba(58,46,38,0.15)';
              e.currentTarget.style.borderColor = '#3a2e26';
            }}>
              <h2 style={{ 
                fontSize: '26px', fontWeight: '400', color: '#3a2e26', 
                marginBottom: '12px', textAlign: 'left',
                fontFamily: "Georgia, 'Times New Roman', serif"
              }}>
                Mockup Generator
              </h2>
              <p style={{ fontSize: '15px', color: '#7a6a5f', textAlign: 'left', marginBottom: 'auto', lineHeight: '1.5' }}>
                Create beautiful 3D mockups of your packaging to visualize the final product.
              </p>
              
              {/* Hand-drawn style illustration for 3D */}
              <div style={{ 
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', 
                gap: '12px', height: '140px', position: 'relative'
              }}>
                {/* Abstract shapes representing a box folding gently */}
                <div style={{ width: '45px', height: '80px', backgroundColor: '#e8b768', borderRadius: '10px 4px 8px 12px', border: '2px solid #3a2e26' }} />
                <div style={{ width: '90px', height: '130px', backgroundColor: '#d48c70', borderRadius: '8px 12px 6px 14px', border: '2px solid #3a2e26', transform: 'translateY(-10px)' }} />
                <div style={{ width: '40px', height: '60px', backgroundColor: '#a9b396', borderRadius: '6px 14px 8px 6px', border: '2px solid #3a2e26' }} />
              </div>
            </div>
          </Link>

          {/* Dieline Generator Card */}
          <Link href="/dielines" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '340px', height: '360px',
              backgroundColor: '#fffcf7',
              border: '2px solid #3a2e26',
              borderRadius: '25px 15px 30px 20px', // Imperfect, different from other card
              padding: '36px',
              display: 'flex', flexDirection: 'column',
              cursor: 'pointer',
              boxShadow: '6px 8px 0px rgba(58,46,38,0.15)',
              transform: 'rotate(2deg)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.transform = 'translateY(-6px) rotate(1deg)'; 
              e.currentTarget.style.boxShadow = '8px 12px 0px rgba(169,179,150,0.3)';
              e.currentTarget.style.borderColor = '#a9b396';
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.transform = 'rotate(2deg)'; 
              e.currentTarget.style.boxShadow = '6px 8px 0px rgba(58,46,38,0.15)';
              e.currentTarget.style.borderColor = '#3a2e26';
            }}>
              <h2 style={{ 
                fontSize: '26px', fontWeight: '400', color: '#3a2e26', 
                marginBottom: '12px', textAlign: 'left',
                fontFamily: "Georgia, 'Times New Roman', serif"
              }}>
                Dieline Generator
              </h2>
              <p style={{ fontSize: '15px', color: '#7a6a5f', textAlign: 'left', marginBottom: 'auto', lineHeight: '1.5' }}>
                Generate precise, print-ready structural patterns that feel just right.
              </p>
              
              {/* Hand-drawn style illustration for Dieline */}
              <div style={{ 
                height: '140px', 
                border: '2px dashed #a9b396', 
                borderRadius: '12px 18px 10px 16px', 
                padding: '16px',
                display: 'flex', flexDirection: 'column', gap: '8px',
                backgroundColor: 'rgba(169,179,150,0.05)'
              }}>
                <div style={{ flex: 1, border: '2px solid #3a2e26', borderRadius: '4px', display: 'flex', gap: '6px', opacity: 0.8 }}>
                  <div style={{ flex: 1, borderRight: '2px solid #3a2e26' }}></div>
                  <div style={{ flex: 3, backgroundColor: 'rgba(232,183,104,0.3)', borderLeft: '2px solid #3a2e26', borderRight: '2px solid #3a2e26' }}></div>
                  <div style={{ flex: 1, borderLeft: '2px solid #3a2e26' }}></div>
                </div>
                <div style={{ flex: 1.5, border: '2px solid #3a2e26', borderRadius: '4px', display: 'flex', gap: '6px' }}>
                  <div style={{ flex: 1, borderRight: '2px solid #3a2e26' }}></div>
                  <div style={{ flex: 3, backgroundColor: 'rgba(212,140,112,0.4)', borderLeft: '2px solid #3a2e26', borderRight: '2px solid #3a2e26' }}></div>
                  <div style={{ flex: 1, borderLeft: '2px solid #3a2e26' }}></div>
                </div>
                 <div style={{ flex: 1, border: '2px solid #3a2e26', borderRadius: '4px', display: 'flex', gap: '6px', opacity: 0.8 }}>
                  <div style={{ flex: 1, borderRight: '2px solid #3a2e26' }}></div>
                  <div style={{ flex: 3, backgroundColor: 'rgba(232,183,104,0.3)', borderLeft: '2px solid #3a2e26', borderRight: '2px solid #3a2e26' }}></div>
                  <div style={{ flex: 1, borderLeft: '2px solid #3a2e26' }}></div>
                </div>
              </div>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}

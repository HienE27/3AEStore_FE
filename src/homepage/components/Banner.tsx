import React from "react";

const Banner = () => {
  return (
    <>
      <style>{`
        .banner-section {
          background-color: #f7f7f7;
          padding: 40px 0;
        }
        
        .banner-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: center;
          gap: 1.5rem;
        }
        
        .banner-item {
          width: 600px;
          height: 370px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          flex-shrink: 0;
        }
        
        .banner-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          .banner-container {
            flex-direction: column;
            gap: 1rem;
          }
          
          .banner-item {
            width: 100%;
            height: 200px;
          }
        }
      `}</style>

      <section className="banner-section">
        <div className="banner-container">
          <div className="banner-item">
            <img
              src="images/banners/nho1.png"
              alt="Banner 1"
            />
          </div>

          <div className="banner-item">
            <img
              src="images/banners/nho2.png"
              alt="Banner 2"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Banner;
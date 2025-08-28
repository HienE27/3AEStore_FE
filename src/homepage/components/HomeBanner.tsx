import React from "react";

const HomeBanner = () => {
  return (
    <>
      <style>{`
        .slider-home-banner .carousel-inner {
          height: auto; /* Thay đổi từ height cố định sang auto */
          min-height: 200px; /* Chiều cao tối thiểu */
        }
        
        .slider-home-banner .carousel-item {
          transition: none !important;
        }
        
        .slider-home-banner .carousel-item img {
          width: 100%;
          height: auto; /* Để ảnh tự động scale theo tỷ lệ gốc */
          display: block; /* Loại bỏ khoảng trắng dưới ảnh */
        }
        
        @media (min-width: 1200px) {
          .slider-home-banner .carousel-inner { min-height: 400px; }
        }
        
        @media (min-width: 768px) and (max-width: 1199px) {
          .slider-home-banner .carousel-inner { min-height: 300px; }
        }
        
        @media (max-width: 767px) {
          .slider-home-banner .carousel-inner { min-height: 200px; }
        }
      `}</style>
      
      <div 
        id="carousel1_indicator" 
        className="slider-home-banner carousel slide" 
        data-ride="carousel" 
        data-interval="4000"
      >
        <ol className="carousel-indicators">
          <li data-target="#carousel1_indicator" data-slide-to="0" className="active"></li>
          <li data-target="#carousel1_indicator" data-slide-to="1"></li>
        </ol>
        
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="images/banners/banner1.jpg" alt="First slide" />
          </div>
          <div className="carousel-item">
            <img src="images/banners/banner2.jpg" alt="Second slide" />
          </div>
        </div>
        
        <a className="carousel-control-prev" href="#carousel1_indicator" role="button" data-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </a>
        <a className="carousel-control-next" href="#carousel1_indicator" role="button" data-slide="next">
          <span className="carousel-control-next-icon"></span>
        </a>
      </div>
    </>
  );
}

export default HomeBanner;
import React from 'react';
import { Link } from 'react-router-dom';

const CategoryList = () => {
  return (
    <>
      <section className="section-content padding-y">
        <div className="container">
          <nav className="row">
            <div className="col-md-3">
              <div className="card card-category">
                <div className="img-wrap" style={{ background: '#ffd7d7' }}>
                  <img src="images/items/1.jpg" alt="Summer shirts" />
                </div>
                <div className="card-body">
                  <h4 className="card-title"><Link to="#">Summer shirts</Link></h4>
                  <ul className="list-menu">
                    <li><Link to="#">Unisex T shirts</Link></li>
                    <li><Link to="#">Casual shirts</Link></li>
                    <li><Link to="#">Scherf Ice cream</Link></li>
                    <li><Link to="#">Another category</Link></li>
                    <li><Link to="#">Great items name</Link></li>
                    <li><Link to="#">Great items name</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-category">
                <div className="img-wrap" style={{ background: '#FFF68D' }}>
                  <img src="images/items/2.jpg" alt="Winter jackets" />
                </div>
                <div className="card-body">
                  <h4 className="card-title"><Link to="#">Winter jackets</Link></h4>
                  <ul className="list-menu">
                    <li><Link to="#">Leather jackets</Link></li>
                    <li><Link to="#">Men's jackets</Link></li>
                    <li><Link to="#">Heating battery clothes</Link></li>
                    <li><Link to="#">Jeans jackets</Link></li>
                    <li><Link to="#">Great items name</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-category">
                <div className="img-wrap" style={{ background: '#bcffb8' }}>
                  <img src="images/items/3.jpg" alt="Shorts" />
                </div>
                <div className="card-body">
                  <h4 className="card-title"><Link to="#">Shorts</Link></h4>
                  <ul className="list-menu">
                    <li><Link to="#">Jeans shorts</Link></li>
                    <li><Link to="#">Swimming shorts</Link></li>
                    <li><Link to="#">Another some shorts</Link></li>
                    <li><Link to="#">Another category</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-category">
                <div className="img-wrap" style={{ background: '#c9fff3' }}>
                  <img src="images/items/4.jpg" alt="Travel bags" />
                </div>
                <div className="card-body">
                  <h4 className="card-title"><Link to="#">Travel bags</Link></h4>
                  <ul className="list-menu">
                    <li><Link to="#">Leather bags</Link></li>
                    <li><Link to="#">Cook & Hold ovens</Link></li>
                    <li><Link to="#">Scherf Ice cream</Link></li>
                    <li><Link to="#">Another category</Link></li>
                    <li><Link to="#">Great items name</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-category">
                <Link to="#" className="img-wrap" style={{ background: '#ddffeb' }}>
                  <img src="images/items/5.jpg" alt="Great items" />
                </Link>
                <div className="card-body">
                  <h4 className="card-title"><Link to="#">Great items</Link></h4>
                  <ul className="list-menu">
                    <li><Link to="#">Combi steamers</Link></li>
                    <li><Link to="#">Cook & Hold ovens</Link></li>
                    <li><Link to="#">Scherf Ice cream</Link></li>
                    <li><Link to="#">Another category</Link></li>
                    <li><Link to="#">Great items name</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-category">
                <Link to="#" className="img-wrap" style={{ background: '#dee4ff' }}>
                  <img src="images/items/6.jpg" alt="Kitchen furniture" />
                </Link>
                <div className="card-body">
                  <h4 className="card-title"><Link to="#">Kitchen furniture</Link></h4>
                  <ul className="list-menu">
                    <li><Link to="#">Combi steamers</Link></li>
                    <li><Link to="#">Cook & Hold ovens</Link></li>
                    <li><Link to="#">Scherf Ice cream</Link></li>
                    <li><Link to="#">Another category</Link></li>
                    <li><Link to="#">Great items name</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-category">
                <Link to="#" className="img-wrap" style={{ background: '#ddffeb' }}>
                  <img src="images/items/2.jpg" alt="Great items" />
                </Link>
                <div className="card-body">
                  <h4 className="card-title"><Link to="#">Great items</Link></h4>
                  <ul className="list-menu">
                    <li><Link to="#">Combi steamers</Link></li>
                    <li><Link to="#">Cook & Hold ovens</Link></li>
                    <li><Link to="#">Scherf Ice cream</Link></li>
                    <li><Link to="#">Another category</Link></li>
                    <li><Link to="#">Great items name</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card card-category">
                <Link to="#" className="img-wrap" style={{ background: '#dee4ff' }}>
                  <img src="images/items/1.jpg" alt="Other clothes" />
                </Link>
                <div className="card-body">
                  <h4 className="card-title"><Link to="#">Other clothes</Link></h4>
                  <ul className="list-menu">
                    <li><Link to="#">Jeans shorts</Link></li>
                    <li><Link to="#">Cook & Hold ovens</Link></li>
                    <li><Link to="#">Scherf Ice cream</Link></li>
                    <li><Link to="#">Another category</Link></li>
                    <li><Link to="#">Great items name</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="padding-y-lg bg-light border-top">
        <div className="container">
          <p className="pb-2 text-center">Delivering the latest product trends and industry news straight to your inbox</p>
          <div className="row justify-content-md-center">
            <div className="col-lg-4 col-sm-6">
              <form className="form-row">
                <div className="col-8">
                  <input className="form-control" placeholder="Your Email" type="email" />
                </div>
                <div className="col-4">
                  <button type="submit" className="btn btn-block btn-warning">
                    <i className="fa fa-envelope"></i> Subscribe
                  </button>
                </div>
              </form>
              <small className="form-text">We’ll never share your email address with a third-party.</small>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CategoryList;
import React from 'react';
import { Link } from 'react-router-dom';

const Address = () => {
  return (
    <>
      {/* ========================= SECTION PAGETOP ========================= */}
      <section className="section-pagetop bg-gray">
        <div className="container">
          <h2 className="title-page">My account</h2>
        </div>
      </section>
      {/* ========================= SECTION PAGETOP END ========================= */}

      {/* ========================= SECTION CONTENT ========================= */}
      <section className="section-content padding-y">
        <div className="container">
          <div className="row">
            {/* Sidebar */}
            <aside className="col-md-3">
              <nav className="list-group">
                <Link className="list-group-item" to="/profile"> Account overview </Link>
                <Link className="list-group-item active" to="/profile/address"> My Address </Link>
                <Link className="list-group-item" to="/profile/orders"> My Orders </Link>
                <Link className="list-group-item" to="/profile/wishlist"> My wishlist </Link>
                <Link className="list-group-item" to="/profile/seller"> My Selling Items </Link>
                <Link className="list-group-item" to="/profile/settings"> Settings </Link>
                <Link className="list-group-item" to="/logout"> Log out </Link>
              </nav>
            </aside>

            {/* Main content */}
            <main className="col-md-9">
              <a href="#" className="btn btn-light mb-3"> <i className="fa fa-plus"></i> Add New Address </a>

              <div className="row">
                <div className="col-md-6">
                  <article className="box mb-4">
                    <h6>London, United Kingdom</h6>
                    <p>Building: Nestone <br /> Floor: 22, Aprt: 12</p>
                    <a href="#" className="btn btn-light disabled"> <i className="fa fa-check"></i> Default</a>
                    <a href="#" className="btn btn-light"> <i className="fa fa-pen"></i> </a>
                    <a href="#" className="btn btn-light"> <i className="text-danger fa fa-trash"></i> </a>
                  </article>
                </div>
                <div className="col-md-6">
                  <article className="box mb-4">
                    <h6>Tashkent, Uzbekistan</h6>
                    <p>Building one <br /> Floor: 2, Aprt: 32</p>
                    <a href="#" className="btn btn-light">Set as Default</a>
                    <a href="#" className="btn btn-light"> <i className="fa fa-pen"></i> </a>
                    <a href="#" className="btn btn-light"> <i className="text-danger fa fa-trash"></i> </a>
                  </article>
                </div>
                <div className="col-md-6">
                  <article className="box mb-4">
                    <h6>Moscow, Russia</h6>
                    <p>Lenin street <br /> Building A, Floor: 3, Aprt: 32</p>
                    <a href="#" className="btn btn-light">Set as Default</a>
                    <a href="#" className="btn btn-light"> <i className="fa fa-pen"></i> </a>
                    <a href="#" className="btn btn-light"> <i className="text-danger fa fa-trash"></i> </a>
                  </article>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
};

export default Address;

import React from 'react';
import { Link } from 'react-router-dom';

const Setting = () => {
  return (
    <>
      <section className="section-pagetop bg-gray">
        <div className="container">
          <h2 className="title-page">My account</h2>
        </div>
      </section>

      <section className="section-content padding-y">
        <div className="container">
          <div className="row">
            <aside className="col-md-3">
              <nav className="list-group">
                <Link className="list-group-item" to="/profile">Account overview</Link>
                <Link className="list-group-item" to="/profile/address">My Address</Link>
                <Link className="list-group-item" to="/profile/orders">My Orders</Link>
                <Link className="list-group-item" to="/profile/wishlist">My wishlist</Link>
                <Link className="list-group-item" to="/profile/seller">My Selling Items</Link>
                <Link className="list-group-item active" to="/profile/settings">Settings</Link>
                <Link className="list-group-item" to="/logout">Log out</Link>
              </nav>
            </aside>

            <main className="col-md-9">
              <div className="card">
                <div className="card-body">
                  <form className="row">
                    <div className="col-md-9">
                      <div className="form-row">
                        <div className="col form-group">
                          <label>Name</label>
                          <input type="text" className="form-control" defaultValue="Vosidiy" title="Enter your name" placeholder="Enter your name" />
                        </div>
                        <div className="col form-group">
                          <label>Email</label>
                          <input type="email" className="form-control" defaultValue="vosidiy@gmail.com" placeholder="Enter your email" />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group col-md-6">
                          <label>Country</label>
                          <label htmlFor="inputState" className="form-label">Country</label>
                          <select id="inputState" className="form-control" defaultValue="United States" aria-label="Country" title="Select your country">
                            <option>Choose...</option>
                            <option>Uzbekistan</option>
                            <option>Russia</option>
                            <option>United States</option>
                            <option>India</option>
                            <option>Afganistan</option>
                          </select>
                        </div>
                        <div className="form-group col-md-6">
                          <label>City</label>
                          <input type="text" className="form-control" placeholder="Enter your city" title="Enter your city" aria-label="City" />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group col-md-6">
                          <label>Zip</label>
                          <input type="text" className="form-control" defaultValue="123009" title="Enter your zip code" placeholder="Enter your zip code" />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Phone</label>
                          <input type="text" className="form-control" defaultValue="+123456789" title="Enter your phone number" placeholder="Enter your phone number" />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary">Save</button>
                      <button type="button" className="btn btn-light ml-2">Change password</button>
                    </div>

                    <div className="col-md">
                      <img src="/images/avatars/avatar1.jpg" className="img-md rounded-circle border" alt="User avatar" />
                    </div>
                  </form>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
};

export default Setting;

import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
    return (
        <div>
            <nav className="navbar d-none d-md-flex p-md-0 navbar-expand-sm navbar-light border-bottom">
                <div className="container">
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTop4" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarTop4">
                        <ul className="navbar-nav mr-auto">
                            <li>
                                <span className="nav-link">
                                    Hi, <Link to="/login">Sign in</Link> or <Link to="/register">Register</Link>
                                </span>
                            </li>
                            <li><Link to="#" className="nav-link">Deals</Link></li>
                            <li><Link to="#" className="nav-link">Sell</Link></li>
                            <li><Link to="#" className="nav-link">Help</Link></li>
                        </ul>
                        <ul className="navbar-nav">
                            <li><Link to="#" className="nav-link"> <img src="images/icons/flags/US.png" height="16" alt="flag" /> Ship to </Link></li>
                            <li className="nav-item dropdown">
                                <Link to="#" className="nav-link dropdown-toggle" data-toggle="dropdown"> Watchlist </Link>
                                <ul className="dropdown-menu small">
                                    <li><Link className="dropdown-item" to="#">First item</Link></li>
                                    <li><Link className="dropdown-item" to="#">Second item</Link></li>
                                    <li><Link className="dropdown-item" to="#">Third item</Link></li>
                                </ul>
                            </li>
                            <li><Link to="#" className="nav-link">My shop</Link></li>
                            <li><Link to="#" className="nav-link"><i className="fa fa-bell"></i></Link></li>
                            <li><Link to="#" className="nav-link"><i className="fa fa-shopping-cart"></i></Link></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container">
                <section className="header-main border-bottom">
                    <div className="row row-sm">
                        <div className="col-6 col-sm col-md col-lg flex-grow-0">
                            <Link to="/" className="brand-wrap">
                                <img className="logo" src="images/logo.svg" alt="logo" />
                            </Link>
                        </div>
                        <div className="col-6 col-sm col-md col-lg flex-md-grow-0">
                            <div className="d-md-none float-right">
                                <Link to="#" className="btn btn-light"><i className="fa fa-bell"></i></Link>
                                <Link to="#" className="btn btn-light"><i className="fa fa-user"></i></Link>
                                <Link to="#" className="btn btn-light"><i className="fa fa-shopping-cart"></i> 2 </Link>
                            </div>
                            <div className="category-wrap d-none dropdown d-md-inline-block">
                                <button type="button" className="btn btn-light dropdown-toggle" data-toggle="dropdown">Shop by</button>
                                <div className="dropdown-menu">
                                    <Link className="dropdown-item" to="#">Machinery / Mechanical Parts / Tools</Link>
                                    <Link className="dropdown-item" to="#">Consumer Electronics / Home Appliances</Link>
                                    <Link className="dropdown-item" to="#">Auto / Transportation</Link>
                                    <Link className="dropdown-item" to="#">Apparel / Textiles / Timepieces</Link>
                                    <Link className="dropdown-item" to="#">Home & Garden / Construction / Lights</Link>
                                    <Link className="dropdown-item" to="#">Beauty & Personal Care / Health</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-xl col-md-5 col-sm-12 flex-grow-1">
                            <form action="#" className="search-header">
                                <div className="input-group">
                                    <input type="text" className="form-control" placeholder="Search" />
                                    <select className="custom-select border-left" name="category_name" aria-label="Select quantity">
                                        <option value="">All type</option>
                                        <option value="codex">Special</option>
                                        <option value="comments">Only best</option>
                                        <option value="content">Latest</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="col col-lg col-md flex-grow-0">
                            <button className="btn btn-block btn-primary" type="submit">Search</button>
                        </div>
                        <div className="col col-lg col-md flex-grow-0">
                            <button className="btn btn-block btn-light" type="submit">Advanced</button>
                        </div>
                    </div>
                </section>

                <nav className="navbar navbar-main navbar-expand pl-0">
                    <ul className="navbar-nav flex-wrap">
                        <li className="nav-item"><Link to="/" className="nav-link">Home</Link></li>

                        <li className="nav-item dropdown">
                            <Link to="#" className="nav-link dropdown-toggle" data-toggle="dropdown">Demo pages</Link>
                            <div className="dropdown-menu dropdown-large">
                                <nav className="row">
                                    <div className="col-6">
                                        <Link to="/">Home page </Link>
                                        <Link to="/categories">All category</Link>
                                        <Link to="/listings/list">Listing list</Link>
                                        <Link to="/cart">Shopping cart</Link>
                                        <Link to="/product-detail">Product detail</Link>
                                        <Link to="/content">Page content</Link>
                                        <Link to="/login">Page login</Link>
                                        <Link to="/register">Page register</Link>
                                    </div>
                                    <div className="col-6">
    <Link to="/profile">Profile main</Link>
    <Link to="/profile/orders">Profile orders</Link>
    <Link to="/profile/seller">Profile seller</Link>
    <Link to="/profile/wishlist">Profile wishlist</Link>
    <Link to="/profile/settings">Profile setting</Link>
    <Link to="/profile/address">Profile address</Link>
</div>

                                </nav>
                            </div>
                        </li>

                        <li className="nav-item"><Link to="#" className="nav-link">Electronics</Link></li>
                        <li className="nav-item"><Link to="#" className="nav-link">Fashion</Link></li>
                        <li className="nav-item"><Link to="#" className="nav-link">Beauty</Link></li>
                        <li className="nav-item"><Link to="#" className="nav-link">Motors</Link></li>
                        <li className="nav-item"><Link to="#" className="nav-link">Sports</Link></li>
                        <li className="nav-item"><Link to="#" className="nav-link">Gardening</Link></li>
                        <li className="nav-item"><Link to="#" className="nav-link">Deals</Link></li>
                        <li className="nav-item"><Link to="#" className="nav-link">Under $10</Link></li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Header;

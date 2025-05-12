import React from "react";

const Footer = () => {
    return (
        <footer className="section-footer bg-secondary text-white">
            <div>
                <div className="container">
                    <section className="footer-top  padding-y-lg">
                        <div className="row">
                            <aside className="col-md-4 col-12">
                                <article className="mr-md-4">
                                    <h5 className="title">Contact us</h5>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in feugiat lorem. </p>
                                    <ul className="list-icon">
                                        <li> <i className="icon fa fa-map-marker"> </i>542 Fake Street, Cityname 10021 Netheerlends </li>
                                        <li> <i className="icon fa fa-envelope"> </i> info@example.com</li>
                                        <li> <i className="icon fa fa-phone"> </i> (800) 060-0730, (800) 060-0730</li>
                                        <li> <i className="icon fa fa-clock"> </i>Mon-Sat 10:00pm - 7:00pm</li>
                                    </ul>
                                </article>
                            </aside>
                            <aside className="col-md col-6">
                                <h5 className="title">Information</h5>
                                <ul className="list-unstyled">
                                    <li> <a href="#">About us</a></li>
                                    <li> <a href="#">Career</a></li>
                                    <li> <a href="#">Find a store</a></li>
                                    <li> <a href="#">Rules and terms</a></li>
                                    <li> <a href="#">Sitemap</a></li>
                                </ul>
                            </aside>
                            <aside className="col-md col-6">
                                <h5 className="title">My Account</h5>
                                <ul className="list-unstyled">
                                    <li> <a href="#">Contact us</a></li>
                                    <li> <a href="#">Money refund</a></li>
                                    <li> <a href="#">Order status</a></li>
                                    <li> <a href="#">Shipping info</a></li>
                                    <li> <a href="#">Open dispute</a></li>
                                </ul>
                            </aside>
                            <aside className="col-md-4 col-12">
                                <h5 className="title">Newsletter</h5>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in feugiat lorem. </p>

                                <form className="form-inline mb-3">
                                    <input type="text" placeholder="Email" className="border-0 w-auto form-control" name="" />
                                    <button className="btn ml-2 btn-warning"> Subscribe</button>
                                </form>

                                <p className="text-white-50 mb-2">Follow us on social media</p>
                                <div>
                                    <a href="#" className="btn btn-icon btn-outline-light"><i className="fab fa-facebook-f"></i></a>
                                    <a href="#" className="btn btn-icon btn-outline-light"><i className="fab fa-twitter"></i></a>
                                    <a href="#" className="btn btn-icon btn-outline-light"><i className="fab fa-instagram"></i></a>
                                    <a href="#" className="btn btn-icon btn-outline-light"><i className="fab fa-youtube"></i></a>
                                </div>

                            </aside>
                        </div>
                    </section>

                    <section className="footer-bottom text-center">
                        <p className="text-white">Privacy Policy - Terms of Use - User Information Legal Enquiry Guide</p>
                        <p className="text-muted"> &copy 2019 Company name, All rights reserved </p>
                        <br />
                    </section>
                </div>
            </div>
        </footer>
    );
}
export default Footer;
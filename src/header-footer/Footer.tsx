import React from "react";

const Footer = () => {
    return (
        <footer className="section-footer bg-secondary text-white">
            <div>
                <div className="container">
                    <section className="footer-top padding-y-lg">
                        <div className="row">
                            <aside className="col-md-4 col-12">
                                <article className="mr-md-4">
                                    <h5 className="title">Liên hệ với chúng tôi</h5>
                                    <p>Chào mừng bạn đến với trang web của chúng tôi. Hãy liên hệ nếu bạn cần hỗ trợ.</p>
                                    <ul className="list-icon">
                                        <li> <i className="icon fa fa-map-marker"> </i>123 Đường ABC, Quận 1, TP.HCM</li>
                                        <li> <i className="icon fa fa-envelope"> </i>support@example.com</li>
                                        <li> <i className="icon fa fa-phone"> </i>(028) 1234-5678, (028) 8765-4321</li>
                                        <li> <i className="icon fa fa-clock"> </i>Thứ 2 - Thứ 7: 8:00 - 22:00</li>
                                    </ul>
                                </article>
                            </aside>
                            <aside className="col-md col-6">
                                <h5 className="title">Thông tin</h5>
                                <ul className="list-unstyled">
                                    <li> <a href="#">Về chúng tôi</a></li>
                                    <li> <a href="#">Tuyển dụng</a></li>
                                    <li> <a href="#">Hệ thống cửa hàng</a></li>
                                    <li> <a href="#">Điều khoản sử dụng</a></li>
                                    <li> <a href="#">Sơ đồ trang</a></li>
                                </ul>
                            </aside>
                            <aside className="col-md col-6">
                                <h5 className="title">Tài khoản của tôi</h5>
                                <ul className="list-unstyled">
                                    <li> <a href="#">Liên hệ</a></li>
                                    <li> <a href="#">Hoàn tiền</a></li>
                                    <li> <a href="#">Trạng thái đơn hàng</a></li>
                                    <li> <a href="#">Thông tin vận chuyển</a></li>
                                    <li> <a href="#">Gửi khiếu nại</a></li>
                                </ul>
                            </aside>
                            <aside className="col-md-4 col-12">
                                <h5 className="title">Đăng ký nhận tin</h5>
                                <p>Đăng ký để nhận thông tin khuyến mãi mới nhất từ chúng tôi.</p>

                                <form className="form-inline mb-3">
                                    <input type="text" placeholder="Email của bạn" className="border-0 w-auto form-control" name="" />
                                    <button className="btn ml-2 btn-warning">Đăng ký</button>
                                </form>

                                <p className="text-white-50 mb-2">Theo dõi chúng tôi trên mạng xã hội</p>
                                <div>
                                    <a href="#" className="btn btn-icon btn-outline-light"><i className="fab fa-facebook-f"></i></a>
                                    <a href="#" className="btn btn-icon btn-outline-light"><i className="fab fa-twitter"></i></a>
                                    <a href="#" className="btn btn-icon btn-outline-light"><i className="fab fa-instagram"></i></a>
                                    <a href="#" className="btn btn-icon btn-outline-light"><i className="fab fa-youtube"></i></a>
                                </div>
                            </aside>

               {/* GOOGLE MAPS */}
						{/* <div className='col-lg-6 col-md-12'>
							<iframe
								title='map'
								src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4184519722444!2d106.78303187407121!3d10.855743457727693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276e7ea103df%3A0xb6cf10bb7d719327!2zSFVURUNIIC0gxJDhuqFpIGjhu41jIEPDtG5nIG5naOG7hyBUUC5IQ00gKFRodSBEdWMgQ2FtcHVzKQ!5e0!3m2!1svi!2s!4v1749607661905!5m2!1svi!2s' 
                                width= '400 '
                                height='250'
								style={{ border: 0 }}
								loading='lazy'
								referrerPolicy='no-referrer-when-downgrade'
							></iframe>
						</div> */}

                        </div>
                    </section>

                    <section className="footer-bottom text-center">
                        <p className="text-white">Chính sách bảo mật - Điều khoản sử dụng - Hướng dẫn tra cứu thông tin</p>
                        <p className="text-muted"> &copy; 2024 Tên công ty, Đã đăng ký bản quyền </p>
                        <br />
                    </section>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
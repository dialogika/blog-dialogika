class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = /*html*/ `

    <!-- ======= Top Bar ======= -->
  <div id="topbar" class="d-flex align-items-center fixed-top">
    <div class="container d-flex justify-content-between">
      <div class="contact-info d-flex align-items-center">
        <i class="bi bi-envelope"></i> <a href="mailto:admin@dialogika.co">admin@dialogika.co</a>
        <i class="bi bi-phone"></i> +62 851 6299 2597
      </div>
      <div class="d-none d-lg-flex social-links align-items-center">
        <a href="https://link.dialogika.co/twitter" class="twitter"><i class="bi bi-twitter"></i></a>
        <a href="https://link.dialogika.co/facebook" class="facebook"><i class="bi bi-facebook"></i></a>
        <a href="https://link.dialogika.co/instagram" class="instagram"><i class="bi bi-instagram"></i></a>
        <a href="https://link.dialogika.co/linkedin" class="linkedin"><i class="bi bi-linkedin"></i></i></a>
      </div>
    </div>
  </div>

      <!-- ======= Header ======= -->
    <header id="header" class="fixed-top">
      <div class="container d-flex align-items-center">

        <a href="../index.html" class="logo me-auto"><img src="../assets/img/logo.webp" alt="" class="img-fluid"></a>

        <nav id="navbar" class="navbar order-last order-lg-0">
          <ul class="navbar-desktop-list">
            <li><a class="nav-link scrollto active" href="../index.html">Home</a></li>
            <li class="dropdown"><a href="https://www.dialogika.co/program/index.html"><span>Program</span> <i class="bi bi-chevron-down"></i></a>
              <ul>
                <li class="dropdown"><a href="#"><span>Online</span> <i class="bi bi-chevron-right"></i></a>
                  <ul>
                    <li><a href="../program/basic-play.html">Basic Play </a></li>
                    <li><a href="../program/basic-class.html">Basic Class <span class="badge rounded-pill text-bg-success">Best Buy</span></a></li>
                    <!-- <li><a href="../program/basic-private.html">Basic Private</a></li> -->
                    <li><hr/></li>
                    <li><a href="../program/kids-play.html">Kids Play</a></li>
                    <li><a href="../program/kids-class.html">Kids Class<span class="badge rounded-pill text-bg-success">Best Buy</span></a></li>
                    <!-- <li><a href="../program/kids-private.html">Kids Private</a></li> -->
                  </ul>
                </li>
                <li class="dropdown"><a href="#"><span>Offline</span> <i class="bi bi-chevron-right"></i></a>
                  <ul>
                    <li><a href="https://www.dialogika.co/program/first-class.html">First Class <span class="badge rounded-pill text-bg-success">Best Buy</span></a></li>
                    <li><a href="https://www.dialogika.co/program/first-kids.html">First Kids</a></li>
                    <li><a href="https://www.dialogika.co/program/first-lite.html">First Lite</a></li>
                    <li><hr/></li>
                    <li><a href="https://www.dialogika.co/program/first-private.html">First Private</a></li>
                  </ul>
                </li>
                <li><hr/></li>
                <li class="dropdown"><a disabled><span>Area</span> <i class="bi bi-chevron-right"></i></a>
                  <ul>
                    <li><a href="https://www.dialogika.co/program/index-jogja.html">Yogyakarta</a></li>
                    <li><a href="https://www.dialogika.co/program/index-tangsel.html">Bintaro</a></li>
                    <li><a href="https://www.dialogika.co/program/index-solo.html">Solo</a></li>
                    <li><a href="https://www.dialogika.co/program/index-banjarbaru.html">Banjarbaru</a></li>
                    <li><a href="https://www.dialogika.co/program/index-surabaya.html">
                      <span>Surabaya</span></a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li class="dropdown"><a href="#"><span>Position</span> <i class="bi bi-chevron-down"></i></a>
              <ul>
                <li><a href="https://www.dialogika.co/intern/client-manager.html">
                    <span>Client Manager</span>
                    <span class="badge bg-success">Best</span></a>
                </li>
                <li><hr/></li>
                <li><a href="https://www.dialogika.co/intern/telemarketing.html">
                    <span>Telemarketing</span>
                    <span class="badge bg-success">Best</span>
                </a></li>
                <li><a href="https://www.dialogika.co/intern/digital-marketing.html">Digital Marketing</a>
                <li><hr/></li>
                <li><a href="https://www.dialogika.co/intern/model-talent.html">
                    <span>Model Talent</span>
                    <span class="badge bg-success">Best</span>
                </a></li>
                <li><a href="https://www.dialogika.co/intern/social-media-analyst.html">
                    <span>Social Media Analyst</span>
                </a></li>
                <li><a href="https://www.dialogika.co/intern/content-writing.html">Content Writing</a></li>
                <li><a href="https://www.dialogika.co/intern/design-specialist.html">Design Specialist</a></li>
                <li><a href="https://www.dialogika.co/intern/html-writing.html">HTML Writing</a></li>
                <li><a href="https://www.dialogika.co/intern/video-editing.html">Video Editor</a></li>
                
                </li>
                <li><hr/></li>
                <li><a href="https://www.dialogika.co/intern/people-development.html">People Development</a></li>
                <li><a href="https://www.dialogika.co/intern/hr-generalist.html">HR Generalist</a></li>
                <li><a href="https://www.dialogika.co/intern/recruiter-specialist.html">
                    <span>Recruiter Specialist</span>
                    <span class="badge bg-success">Best</span>
                </a></li>
              </ul>
          </li>
          <li><a class="nav-link scrollto" href="https://www.dialogika.co/intern/resume/">Resume</a></li>
            <li class="dropdown" style="color: #0b2b6a"><a disabled><span>More</span> <i class="bi bi-chevron-down"></i></a>
              <ul>
                <li><a href="../event/">Event</a></li>
                <li><a href="../about">About Us</a></li>
                <li><a href="../shop">Shop</a></li>
                <li><a href="../blog">Blog</a></li>
                <li><a href="../service/">Service</a></li>
              </ul>
            </li>
            
          </ul>
          <i class="bi bi-list d-block d-md-none" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"></i>
        </nav><!-- .navbar -->

        <a href="https://www.dialogika.co/link/candidate-screening.html" class="appointment-btn">Daftar <span class="d-md-inline">Sekarang</span></a>

      </div>
    </header><!-- End Header -->

    <!-- ======= Mobile Nav ======= -->
      <nav class="navbar-canvas fixed-top">
        <div class="container-fluid">
          <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
            <div class="offcanvas-header">
              <a href="https://www.dialogika.co/index.html">
                <img src="../assets/img/logo.webp" class="offcanvas-title" id="offcanvasNavbarLabel"/>
              </a>
              <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
            </div>
            <div class="offcanvas-body">
              <a href="https://www.dialogika.co/index.html"><div class="card"><div class="card-body">Home</div></div></a>

              <!-- Program (match desktop) -->
              <div class="card">
                <a href="#program-collapse" data-bs-toggle="collapse">
                  <div class="card-body d-flex justify-content-between">
                    <span>Program</span><i class='bx bxs-chevron-down bx-tada'></i>
                  </div>
                </a>
                <div class="collapse" id="program-collapse">
                  <!-- Online -->
                  <a href="#program-online" data-bs-toggle="collapse">
                    <div class="card">
                      <div class="card-body d-flex justify-content-between">
                        <span>Online</span>
                        <i class='bx bxs-chevron-down bx-tada'></i>
                      </div>
                      <div class="collapse" id="program-online">
                        <a href="../program/basic-play.html"><div class="card card-body">Basic Play</div></a>
                        <a href="../program/basic-class.html">
                          <div class="card card-body">
                            <div class="d-flex justify-content-between">
                              <span>Basic Class</span>
                              <span class="badge rounded-pill text-bg-success">Best Buy</span>
                            </div>
                          </div>
                        </a>
                        <li style="list-style:none"><hr/></li>
                        <a href="../program/kids-play.html"><div class="card card-body">Kids Play</div></a>
                        <a href="../program/kids-class.html">
                          <div class="card card-body">
                            <div class="d-flex justify-content-between">
                              <span>Kids Class</span>
                              <span class="badge rounded-pill text-bg-success">Best Buy</span>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </a>

                  <!-- Offline -->
                  <a href="#program-offline" data-bs-toggle="collapse">
                    <div class="card">
                      <div class="card-body d-flex justify-content-between">
                        <span>Offline</span>
                        <i class='bx bxs-chevron-down bx-tada'></i>
                      </div>
                      <div class="collapse" id="program-offline">
                        <a href="https://www.dialogika.co/program/first-class.html">
                          <div class="card card-body">
                            <div class="d-flex justify-content-between">
                              <span>First Class</span>
                              <span class="badge rounded-pill text-bg-success">Best Buy</span>
                            </div>
                          </div>
                        </a>
                        <a href="https://www.dialogika.co/program/first-kids.html"><div class="card card-body">First Kids</div></a>
                        <a href="https://www.dialogika.co/program/first-lite.html"><div class="card card-body">First Lite</div></a>
                        <li style="list-style:none"><hr/></li>
                        <a href="https://www.dialogika.co/program/first-private.html"><div class="card card-body">First Private</div></a>
                      </div>
                    </div>
                  </a>

                  <!-- Area -->
                  <a href="#program-area" data-bs-toggle="collapse">
                    <div class="card">
                      <div class="card-body d-flex justify-content-between">
                        <span>Area</span>
                        <i class='bx bxs-chevron-down bx-tada'></i>
                      </div>
                      <div class="collapse" id="program-area">
                        <a href="https://www.dialogika.co/program/index-jogja.html"><div class="card card-body">Yogyakarta</div></a>
                        <a href="https://www.dialogika.co/program/index-tangsel.html"><div class="card card-body">Bintaro</div></a>
                        <a href="https://www.dialogika.co/program/index-solo.html"><div class="card card-body">Solo</div></a>
                        <a href="https://www.dialogika.co/program/index-banjarbaru.html"><div class="card card-body">Banjarbaru</div></a>
                        <a href="https://www.dialogika.co/program/index-surabaya.html"><div class="card card-body">Surabaya</div></a>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              <!-- Position -->
              <div class="card">
                <a href="#position-collapse" data-bs-toggle="collapse">
                  <div class="card-body d-flex justify-content-between">
                    <span>Position</span><i class='bx bxs-chevron-down bx-tada'></i>
                  </div>
                </a>
                <div class="collapse" id="position-collapse">
                  <a href="https://www.dialogika.co/intern/client-manager.html">
                    <div class="card card-body">
                      <div class="d-flex justify-content-between">
                        <span>Client Manager</span>
                        <span class="badge bg-success">Best</span>
                      </div>
                    </div>
                  </a>
                  <li style="list-style:none"><hr/></li>
                  <a href="https://www.dialogika.co/intern/telemarketing.html">
                    <div class="card card-body">
                      <div class="d-flex justify-content-between">
                        <span>Telemarketing</span>
                        <span class="badge bg-success">Best</span>
                      </div>
                    </div>
                  </a>
                  <a href="https://www.dialogika.co/intern/digital-marketing.html"><div class="card card-body">Digital Marketing</div></a>
                  <li style="list-style:none"><hr/></li>
                  <a href="https://www.dialogika.co/intern/model-talent.html">
                    <div class="card card-body">
                      <div class="d-flex justify-content-between">
                        <span>Model Talent</span>
                        <span class="badge bg-success">Best</span>
                      </div>
                    </div>
                  </a>
                  <a href="https://www.dialogika.co/intern/social-media-analyst.html"><div class="card card-body">Social Media Analyst</div></a>
                  <a href="https://www.dialogika.co/intern/content-writing.html"><div class="card card-body">Content Writing</div></a>
                  <a href="https://www.dialogika.co/intern/design-specialist.html"><div class="card card-body">Design Specialist</div></a>
                  <a href="https://www.dialogika.co/intern/html-writing.html"><div class="card card-body">HTML Writing</div></a>
                  <a href="https://www.dialogika.co/intern/video-editing.html"><div class="card card-body">Video Editor</div></a>
                  <li style="list-style:none"><hr/></li>
                  <a href="https://www.dialogika.co/intern/people-development.html"><div class="card card-body">People Development</div></a>
                  <a href="https://www.dialogika.co/intern/hr-generalist.html"><div class="card card-body">HR Generalist</div></a>
                  <a href="https://www.dialogika.co/intern/recruiter-specialist.html">
                    <div class="card card-body">
                      <div class="d-flex justify-content-between">
                        <span>Recruiter Specialist</span>
                        <span class="badge bg-success">Best</span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              <!-- Resume (desktop single link) -->
              <a href="https://www.dialogika.co/intern/resume/">
                <div class="card card-body">
                  <div class="justify-content-between d-flex">
                    <span>Resume</span>
                  </div>
                </div>
              </a>

              <!-- More (match desktop) -->
              <div class="card">
                <a href="#more-collapse" data-bs-toggle="collapse">
                  <div class="card-body d-flex justify-content-between">
                    <span>More</span><i class="bi bi-chevron-down"></i>
                  </div>
                </a>
                <div class="collapse" id="more-collapse">
                  <a href="../event/"><div class="card card-body">Event</div></a>
                  <a href="../about"><div class="card card-body">About Us</div></a>
                  <a href="../shop"><div class="card card-body">Shop</div></a>
                  <a href="../blog"><div class="card card-body">Blog</div></a>
                  <a href="../service/"><div class="card card-body">Service</div></a>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </nav>
      <!-- End Mobile Nav -->

    `;
  }
}

//Footer
class Footer extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.innerHTML = /*html*/ `
  
  <!-- ======= Footer ======= -->
  <footer id="footer">

    <div class="footer-top">
      <div class="container">
        <div class="row justify-content-between">

          <div class="col-lg-3 col-md-6 footer-contact">
            <h3><img src="../assets/img/white-logo.webp" class="footer-logo" alt="Kelas Public Speaking Jogja" /></h3>
            <p>
              Wadah pengembangan diri membangun aura positif sekaligus meningkatkan kualitas skill, karir hingga level
              kehidupan Anda.
            </p><br>
            <p>Kami memberikan pelatihan Kelas Public Speaking karena dengan menguasai Public Speaking, mental,
              perilaku, penampilan hingga sikap Anda terbentuk.</p><br>
            <h4 class="d-flex justify-content-between">Contact Us<i class='bi bi-chevron-down d-md-none'></i></h4>
            <div class="social-link d-flex mt-3">
              <a href="https://link.dialogika.co/wasap-2597-dialogika-co"
                class="text-light d-flex align-items-center justify-content-center"><i class="bi bi-whatsapp"></i></a>
              <a href="mailto:hello@dialogika.co" class="d-flex align-items-center justify-content-center"><i
                  class="bi bi-envelope-at-fill"></i></a>
            </div>
            <hr />
            <p>Punya pertanyaan mengenai Dialogika?</p>
            <br>
            <p>
              <strong>Phone:</strong> +62 851-6299-2597<br>
              <strong>Email:</strong> hello@dialogika.co<br>
            </p>
            <br><br>
            <h4 class="d-flex justify-content-between">Follow Us<i class='bi bi-chevron-down d-md-none'></i></h4>
            <div class="social-link d-flex mt-3">
              <a href="https://link.dialogika.co/twitter" class="d-flex align-items-center justify-content-center"><i
                  class="bi bi-twitter"></i></a>
              <a href="https://link.dialogika.co/facebook" class="d-flex align-items-center justify-content-center"><i
                  class="bi bi-facebook"></i></a>
              <a href="https://link.dialogika.co/instagram" class="d-flex align-items-center justify-content-center"><i
                  class="bi bi-instagram"></i></a>
              <a href="https://link.dialogika.co/linkedin" class="d-flex align-items-center justify-content-center"><i
                  class="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div class="col-lg-2 col-md-6 footer-links accordion">

            <div class="">
              <a href="#footer-best-program" class="d-flex justify-content-between " data-bs-toggle="collapse" id="footer-accordion">
                <h4>Online Program</h4><i class='bi bi-chevron-down d-md-none'></i>
              </a>
              <ul class="accordion-collapse collapse show" id="footer-best-program" data-bs-parent=".footer-links">
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../program/basic-plus.html">
                    Basic Plus
                    <span class="badge rounded-pill text-bg-info">Best Selling</span>
                  </a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../program/kids-plus.html">Kids Plus</a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../program/basic-private.html">Basic Private</a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../program/kids-private.html">Kids Private</a>
                </li>
              </ul>
            </div><br>

            <div class="">
              <a href="#footer-corporate-program" class="d-flex justify-content-between" data-bs-toggle="collapse" id="footer-accordion">
                <h4>Offline Program</h4><i class='bi bi-chevron-down d-md-none'></i>
              </a>
              <ul class="accordion-collapse collapse show" id="footer-corporate-program">
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../program/index-jogja.html">
                    Yogyakarta
                    <span class="badge rounded-pill text-bg-info">Best Selling</span>
                  </a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../corporate/index.html">Corporate</a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../program/index-tangsel.html">
                    Bintaro
                    <span class="badge rounded-pill text-bg-warning">Private Only</span>
                  </a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="https://www.dialogika.co/page/kelas-public-speaking-surabaya-new/">Surabaya </a>
                </li>
              </ul>
            </div><br>

            <div class="">
              <a href="#footer-private-program" class="d-flex justify-content-between" data-bs-toggle="collapse" id="footer-accordion">
                <h4>Kids Program</h4><i class='bi bi-chevron-down d-md-none'></i>
              </a>
              <ul class="accordion-collapse collapse show" id="footer-private-program" data-bs-parent=".footer-links">
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../program/kids-plus.html">Online Class</a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../program/first-kids.html">Offline Class</a>
                </li>
              </ul>
            </div><br>


            <div class="">
              <a href="#footer-career-info" class="d-flex justify-content-between" data-bs-toggle="collapse" id="footer-accordion">
                <h4>Recruitment</h4><i class='bi bi-chevron-down d-md-none'></i>
              </a>
              <ul class="accordion-collapse collapse show" id="footer-career-info" data-bs-parent=".footer-links">
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../mentor/">Mentor</a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../intern/index.html">Internship</a>
                </li>
              </ul>
              <br>
            </div>

            <div class="">
              <a href="#footer-useful-link" class="d-flex justify-content-between" data-bs-toggle="collapse" id="footer-accordion">
                <h4>Useful Link</h4><i class='bi bi-chevron-down d-md-none'></i>
              </a>
              <ul class="accordion-collapse collapse show" id="footer-useful-link" data-bs-parent=".footer-links">
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../blog/index.html">Blog Dialogika</a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../mentor/index.html">Mentor Dialogika</a>
                </li>
              </ul>
            </div>
          </div>

          <div class="col-lg-3 col-md-6 footer-links">
            <div class="">
              <a href="#footer-about-dialogika" class="d-flex justify-content-between" data-bs-toggle="collapse"
                id="footer-accordion">
                <h4>About Dialogika</h4><i class='bi bi-chevron-down d-md-none'></i>
              </a>
              <ul class="accordion-collapse collapse show" id="footer-about-dialogika" data-bs-parent=".footer-links">
                <li><i class="bi bi-chevron-right"></i>
                  <a href="https://www.dialogika.co/about">About Us</a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="https://www.dialogika.co/help/payment">Frequent Asked Question</a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="https://www.dialogika.co/help/">Help Center</a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="https://www.dialogika.co/policy/">Privacy Policy</a>
                </li>
                <li><i class="bi bi-chevron-right"></i>
                  <a href="../about/terms.html">Terms & Agreements</a>
                </li>
              </ul><br/>
            </div>
            <div class="">
              <div class="footer-recent-post align-items-center">
                <h4>Instagram Post <i class='bi bi-chevron-down d-md-none'></i></h4>
                <ul>
                  <li class="clearfix">
                    <img src="../assets/img/ig/1.jpg" alt="" class="rounded ig-post float-left" style="margin-right: 10px;width: 70px;height: 70px; border-radius: 10px;">
                    <div class="post float-left">
                      <a target="__blank" href="https://www.instagram.com/p/Claa6CPISTB/">Gambaran kelas praktek public speaking secara offline</a>
                      <div class="date"><i class="bi bi-calendar" aria-hidden="true"></i> Nov 26, 2022</div>
                    </div>
                  </li>
                  <hr/>
                  <li class="clearfix">
                    <img src="../assets/img/ig/2.jpg" alt="" class="rounded ig-post float-left" style="margin-right: 10px;width: 70px;height: 70px; border-radius: 10px;">
                    <div class="post float-left">
                      <a target="__blank" href="https://www.instagram.com/p/CyXfjtkrJe7/">Tips-tips agar di notice dosen didalam kelas dan latihan membangun persona.</a>
                      <div class="date"><i class="bi bi-calendar" aria-hidden="true"></i> Oct 14, 2023</div>
                    </div>
                  </li>
                  <hr/>
                  <li class="clearfix">
                    <img src="../assets/img/ig/3.jpg" alt="" class="rounded ig-post float-left" style="margin-right: 10px;width: 70px;height: 70px; border-radius: 10px;">
                    <div class="post float-left">
                      <a target="__blank" href="https://www.instagram.com/p/CzAf73qr2mj/">5 tips jitu atasi otak yang ngeblank saat berbicara di depan umum</a>
                      <div class="date"><i class="bi bi-calendar" aria-hidden="true"></i> Oct 30, 2023</div>
                    </div>
                  </li>
                  <hr/>
                  <li class="clearfix">
                    <img src="../assets/img/ig/4.jpg" alt="" class="rounded ig-post float-left" style="margin-right: 10px;width: 70px;height: 70px; border-radius: 10px;">
                    <div class="post float-left">
                      <a target="__blank" href="blog-details.html">5 trik untuk para newbie agar viral di depan umum. (Cocok untuk konten creator)</a>
                      <div class="date"><i class="bi bi-calendar" aria-hidden="true"></i> Nov 2, 2023</div>
                    </div>
                  </li>
                </ul>
              </div> <!-- /.footer-recent-post -->
            </div>
          </div>

          <div class="col-lg-4 col-md-6 footer-newsletter">
            <h4 class="d-flex justify-content-between">Join Whatsapp Group Community<i
                class='bi bi-chevron-down d-md-none'></i></h4>
            <p>Secara Berkala Kami Akan Bagi-Bagi Tips & Trik Gratis, Dan Info Promo Lainnya</p>
            <form action="javascript:void" role="form" id="subcriptions" method="post">
              <input type="tel" name="Surel" class="custom-input-footer" placeholder="Join Our Class Group" disabled>
              <button type="button" data-bs-toggle="modal" data-bs-target="#footerSubModal" class="blue-dialogika-btn footerSubBtn">Gabung</button>
            </form>
            <br><br>
            <h4 class="d-flex justify-content-between">Payment Method<i class='bi bi-chevron-down d-md-none'></i></h4>
            <p><i class="bi bi-chevron-down"></i> Bank Transfer</p>
            <img src="../assets/img/bank.webp" style="width:100%;"/>
            <br><br>
            <p><i class="bi bi-chevron-down"></i> E-Wallet</p>
            <img src="../assets/img/wallet.webp" style="width:100%;"/>

            <ul class="list-group border-warning" style="background: transparent;">
              <li class="list-group-item">
                <b>Telah Terdaftar Oleh</b><br>
                <img src="../assets/img/ham.webp" class="" /><br>
                <strong>Nomor:</strong> AHU-0118640.AH.01.11.TAHUN 2022<br>
                <strong>Registrasi: </strong>4022062334106037<br />
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>

    <div class="container d-md-flex py-4">

      <div class="me-md-auto text-center text-md-start">
        <div class="copyright">
          &copy; Copyright <strong><span>Dialogika</span></strong> | PT. Dialogika Persona Indonesia
        </div>

      </div>
      <div class="social-links ">
        <a href="https://link.dialogika.co/twitter" class="twitter"><i class="bi bi-twitter"></i></a>
        <a href="https://link.dialogika.co/facebook" class="facebook"><i class="bi bi-facebook"></i></a>
        <a href="https://link.dialogika.co/instagram" class="instagram"><i class="bi bi-instagram"></i></a>
        <a href="https://link.dialogika.co/wasap-2597-dialogika-co" class="google-plus"><i
            class="bi bi-whatsapp"></i></a>
        <a href="https://link.dialogika.co/linkedin" class="linkedin"><i class="bi bi-linkedin"></i></a>
      </div>
    </div>
  </footer><!-- End Footer -->

    `;
  }
}

customElements.define("main-footer", Footer);
customElements.define("main-header", Header);

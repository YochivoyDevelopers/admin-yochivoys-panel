import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { state, style, transition, animate, trigger, AUTO_STYLE } from '@angular/animations';
import 'rxjs/add/operator/filter';
import { MenuItems } from '../../shared/menu-items/menu-items';
import { ApisService } from 'src/app/services/apis.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
    trigger('slideOnOff', [
      state('on', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('off', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      transition('on => off', animate('400ms ease-in-out')),
      transition('off => on', animate('400ms ease-in-out'))
    ]),
    trigger('mobileMenuTop', [
      state('no-block, void',
        style({
          overflow: 'hidden',
          height: '0px',
        })
      ),
      state('yes-block',
        style({
          height: AUTO_STYLE,
        })
      ),
      transition('no-block <=> yes-block', [
        animate('400ms ease-in-out')
      ])
    ])
  ]
})
export class AdminComponent implements OnInit {
  deviceType = 'desktop';
  verticalNavType = 'expanded';
  verticalEffect = 'shrink';
  chatToggle = 'out';
  chatInnerToggle = 'off';
  innerHeight: string;
  isScrolled = false;
  isCollapsedMobile = 'no-block';
  toggleOn = true;
  windowWidth: number;
  currentDate: string = '';
  currentTime: string = '';
  currentYear: number;
  isModalOpen = false;
  @ViewChild('searchFriends', /* TODO: add static flag */ { static: false }) search_friends: ElementRef;
  @ViewChild('toggleButton', /* TODO: add static flag */ { static: false }) toggle_button: ElementRef;
  @ViewChild('sideMenu', /* TODO: add static flag */ { static: false }) side_menu: ElementRef;

  config: any;

  isNavbarVisible: boolean = true;
  isSideMenuVisible: boolean = true;
  searchText: string = '';
  usuarios: any[] = [];
  filteredUsuarios: any[] = [];

  constructor(
    public menuItems: MenuItems,
    private api: ApisService,
    private router: Router,
    private translate: TranslateService) {
    const scrollHeight = window.screen.height - 150;
    this.innerHeight = scrollHeight + 'px';
    this.windowWidth = window.innerWidth;
    this.setMenuAttributs(this.windowWidth);
    localStorage.setItem('lng', 'spanish');
    this.translate.use(localStorage.getItem('lng'));
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit() {
    console.log('Ruta actual:', this.router.url);
    this.updateDateTime(); // Inicializamos la fecha y hora
    setInterval(() => {
      this.updateDateTime(); // Actualizamos cada segundo
    }, 1000);
  }

  onInputChange(searchText: string) {
    this.searchText = searchText;
    this.getUsuarios();
  }

  getUsuarios() {
    this.api.getUsers().then((data) => {
      if (data && data.length) {
        this.usuarios = data;
        // Asignar un valor por defecto si fullname está indefinido
        this.filteredUsuarios = this.usuarios.filter(usuario => {
          let nombre = usuario.fullname || "Sin nombre"; // Valor por defecto
          return nombre.toLowerCase().includes(this.searchText.toLowerCase());
        });
      } else {
        this.filteredUsuarios = [];
      }
    }).catch(error => {
      console.log(error);
    });
  }



  onClickedOutside(e: Event) {
    if (this.windowWidth < 768 && this.toggleOn && this.verticalNavType !== 'offcanvas') {
      this.toggleOn = true;
      this.verticalNavType = 'offcanvas';
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  redirectToHome(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  redirectToCity(): void {
    this.router.navigate(['/admin-cities']);
  }

  redirectToRestaurants(): void {
    this.router.navigate(['/admin-restaurants']);
  }

  redirectToUsers(): void {
    this.router.navigate(['/admin-users']);
  }

  redirectToDrivers(): void {
    this.router.navigate(['/admin-drivers']);
  }

  redirectToOrders(): void {
    this.router.navigate(['/admin-orders']);
  }

  redirectToBanners(): void {
    this.router.navigate(['/admin-banners']);
  }

  redirectToCoupons(): void {
    this.router.navigate(['/admin-coupons']);
  }

  redirectToNotifications(): void {
    this.router.navigate(['/admin-notification']);
  }

  redirectToChats(): void {
    this.router.navigate(['/admin-chats']);
  }

  redirectToStats(): void {
    this.router.navigate(['/admin-rest-stats']);
  }


  isActive(urls: string[]): boolean {
    const currentUrl = this.router.url;
    const isActiveRoute = urls.some(url => currentUrl.startsWith(url));

    //console.log(`¿Es activa alguna de las rutas? ${isActiveRoute}`);

    return isActiveRoute;
  }

  updateDateTime(): void {
    const date = new Date();

    // Formateamos la fecha
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.currentDate = date.toLocaleDateString('es-ES', options);

    // Formateamos la hora
    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    this.currentTime = date.toLocaleTimeString('es-ES', timeOptions);
  }


  changeLng(lng) {
    localStorage.setItem('lng', lng);
    this.translate.use(lng);
  }
  onResize(event) {
    this.innerHeight = event.target.innerHeight + 'px';
    /* menu responsive */
    this.windowWidth = event.target.innerWidth;
    let reSizeFlag = true;
    if (this.deviceType === 'tablet' && this.windowWidth >= 768 && this.windowWidth <= 1024) {
      reSizeFlag = false;
    } else if (this.deviceType === 'mobile' && this.windowWidth < 768) {
      reSizeFlag = false;
    }

    if (reSizeFlag) {
      this.setMenuAttributs(this.windowWidth);
    }
  }

  setMenuAttributs(windowWidth) {
    if (windowWidth >= 768 && windowWidth <= 1024) {
      this.deviceType = 'tablet';
      this.verticalNavType = 'offcanvas';
      this.verticalEffect = 'push';
    } else if (windowWidth < 768) {
      this.deviceType = 'mobile';
      this.verticalNavType = 'offcanvas';
      this.verticalEffect = 'overlay';
    } else {
      this.deviceType = 'desktop';
      this.verticalNavType = 'expanded';
      this.verticalEffect = 'shrink';
    }
  }

  searchFriendList(event) {
    const search = (this.search_friends.nativeElement.value).toLowerCase();
    let search_input: string;
    let search_parent: any;
    const friendList = document.querySelectorAll('.userlist-box .media-body .chat-header');
    Array.prototype.forEach.call(friendList, function (elements, index) {
      search_input = (elements.innerHTML).toLowerCase();
      search_parent = (elements.parentNode).parentNode;
      if (search_input.indexOf(search) !== -1) {
        search_parent.classList.add('show');
        search_parent.classList.remove('hide');
      } else {
        search_parent.classList.add('hide');
        search_parent.classList.remove('show');
      }
    });
  }

  toggleChat() {
    this.chatToggle = this.chatToggle === 'out' ? 'in' : 'out';
  }

  toggleChatInner() {
    this.chatInnerToggle = this.chatInnerToggle === 'off' ? 'on' : 'off';
  }

  toggleOpened() {
    if (this.windowWidth < 768) {
      this.toggleOn = this.verticalNavType === 'offcanvas' ? true : this.toggleOn;
      this.verticalNavType = this.verticalNavType === 'expanded' ? 'offcanvas' : 'expanded';
    } else {
      this.verticalNavType = this.verticalNavType === 'expanded' ? 'offcanvas' : 'expanded';
      this.isNavbarVisible = !this.isNavbarVisible;
      this.isSideMenuVisible = !this.isSideMenuVisible;
    }
  }
  onMobileMenu() {
    this.isCollapsedMobile = this.isCollapsedMobile === 'yes-block' ? 'no-block' : 'yes-block';
  }

  onScroll(event) {
    this.isScrolled = false;
  }
  logout() {
    this.api.logout().then(() => {
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
    const lng = localStorage.getItem('lng');
    localStorage.clear();
    localStorage.setItem('lng', lng);
    this.router.navigate(['auth/login']);
  }
  getName(name) {
    return this.api.translate(name);
  }
}

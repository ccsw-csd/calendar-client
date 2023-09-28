import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavigatorService } from '../../services/navigator.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  @Output() toggleMenuEmitter: EventEmitter<any> = new EventEmitter();

  visibleSideBar = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private navigatorService : NavigatorService,
    public router: Router
  ) { }

  ngOnInit() {

    this.activatedRoute.data.subscribe((response) => { 
      this.authService.refreshToken(response.credentials);
      this.authService.registerAccess().subscribe();
    });
  }

  public toggleMenu() : void {
    this.visibleSideBar = !this.visibleSideBar;

    this.navigatorService.emitNavigatorChangeEvent(this.visibleSideBar);
  }

}

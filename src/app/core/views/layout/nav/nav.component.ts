import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { AuthService } from 'src/app/core/services/auth.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import packageInfo from '../../../../../../package.json';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  frontVersion : string = packageInfo.version;
  backVersion : string = "1.0.0";
  items: MenuItem[];

  constructor(
    public authService: AuthService,
    public dialogService: DialogService,
    public utilsService: UtilsService
  ) { }

  ngOnInit(): void {

    this.items = [
      {
        label: "Gestión Personal", routerLink: '/personal'
      },
      {
        label: "Gestión Becarios", routerLink: '/intern'
      },
      {
        label: "Pyramid Index", routerLink: '/pyramid'
      },
      {
        label: "Pyramid Team Index", routerLink: '/pyramid-team'
      },
      {
        label: "Mantenimiento",
        expanded: true,
        items: [
          {label: "Centros Educativos", routerLink: '/education-center'},
          {label: "Titulaciones", routerLink: '/education'},
          {label: "Tecnologías", routerLink: '/technology'}
       ]
      }
    ];

    this.utilsService.getAppVersion().subscribe((result: any) => {
      this.backVersion = result.version;
    });
  }

}

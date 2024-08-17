import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavItem } from '../nav-items';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.css']
})
export class MenuItemComponent {
  @Input() items!: NavItem[];
  @ViewChild('childMenu', { static: true }) public childMenu: any;
  constructor(
    public router: Router
  ) {

  }


  navigate(item:any){
    this.router.navigate([item.route]);

  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TreeStencilServiceService {

  constructor(private http: HttpClient) { }
  LoadGraphItems() {
    return this.http.get("../assets/TreeStencil.json");
  }
}

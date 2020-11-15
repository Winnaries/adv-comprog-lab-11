import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NavController, InfiniteScroll } from 'ionic-angular';

type Quiz = 
  | 'quiz1'
  | 'quiz2'
  | 'quiz3'
  | 'quiz4'
  | 'quiz5';

interface Student extends Record<Quiz, number> {
  id: number;
}

interface Response {
  data: Student[];
}

interface InfiniteScrollEvent {
  target: InfiniteScroll;
  complete: () => void;
  enable: (arg: boolean) => void; 
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private http: HttpClient;
  private students: Student[];

  constructor(client: HttpClient, public navCtrl: NavController) {
    this.students = [];
    this.http = client;
  }

  async ionViewDidLoad() {
    this.students = await this.fetchStudents(0);
  }

  async loadMore(event: InfiniteScrollEvent) {
    // this.students is always sorted in ascending order
    // so we can assume that the last index contains the max id
    const id = this.students[this.students.length - 1].id;
    const students = await this.fetchStudents(id);

    this.students = [
      ...this.students, 
      ...students
    ];

    event.complete();

    if (this.students.length >= 1000) {
      event.enable(false);
    }
  }

  async fetchStudents(id: number) {
    return new Promise<Student[]>((resolve) => {
      const params = new HttpParams({
        fromObject: {
          id: `${id}`
        }
      });

      // the API returns 20 students with ID greater than specified
      // ** does not return student with ID equals to the one specified **
      this.http
        .get<Response>("http://f2bf2b782299.ngrok.io/get", { params })
        .subscribe(resp => resolve(resp.data));
    });
  }

}

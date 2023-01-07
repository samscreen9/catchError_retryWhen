import { Component, OnInit } from '@angular/core';
import {
  of,
  AsyncSubject,
  BehaviorSubject,
  interval,
  ReplaySubject,
  Subject,
  Observable,
  map,
  catchError,
  throwError,
  take,
  retry,
  delay,
  tap,
  retryWhen
} from 'rxjs';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  name = 'Angular';
  /*if an observable encounters with error that we can handle it by CatchError or retry before its been subscribed, it can return  new observable or throw an error*/

  ngOnInit() {
    let obs1 = new Observable((observer) => {
      observer.next(1);
      observer.next(2);
      observer.error('error');
    });
    /*****returning a new obsrvable****/
    obs1
      .pipe(
        map((x) => {
          return x;
        }),
        catchError((e) => {
          return of(4, 5);
        })
      ) //if no return then {} not required
      .subscribe(
        (data) => {
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );
    /*************throwing error**************/
    obs1
      .pipe(
        catchError((e) => {
          throw 'data Error';
        })
      )
      .subscribe(
        (data) => {
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );
    /*************using caught *************/
    /*caught in catchError subscribes source obervable, here value 1,2 infintly unless limited by take() to take few only */
    console.log('caught starts from here');
    obs1
      .pipe(
        catchError((e, caught) => {
          return caught;
        }),
        take(2)
      )
      .subscribe(
        (data) => {
          console.log(data);
        },
        (error) => {
          console.log(error);
        }
      );

    console.log('retry starts here');
    /*************Retry if  you want to observable to re run again with certain times******************/
    obs1
      .pipe(
        retry(1),
        catchError((e) => {
          return of('a');
        })
      )
      .subscribe(
        (data) => {
          console.log(data + ' ' + 'retry');
        },
        (error) => {
          console.log(error);
        }
      );

      let usersData={
        responseStatus:'500',
        users:[{id:1,name:"n1"},{id:2,name:"n2"}]
      };
      of(...usersData.users)
         .pipe(
        delay(1000),
        tap((user)=>{
          /*status is checked here if 2 which is False whoes ! is True so condition is satisfied and throw is executed, this throw invokes retry when. if not satisfied retyWhen will not be invoked*/
          if(!usersData.responseStatus.startsWith('2')){
         throw usersData.responseStatus;
        }
        }),
        retryWhen((e)=>{
         return e.pipe(
         tap((status)=>{
         if(false){
         throw 'error'
        }
        console.log('retrying');
        /*in retrywhen reexecutes observable,with delat 1s where after 2s of setTimeout status starts with 2 and throw is prevented, thus  retry prevented*/
        })
        );
        })
         )
      .subscribe(
          (data)=>{console.log(data);},
          (error)=>{console.log(error);
          });
        
        setTimeout(()=>{
        usersData.responseStatus='200'},2000);
  }
}


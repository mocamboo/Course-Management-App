import {api, LightningElement, track} from 'lwc';
import generateData from './helper';

export default class Coursera extends LightningElement {
  @track isTrue = false;

  courses = [];
  //Design Attributes
  @api pageSize = 6;

  get showcart () {
    return this.isTrue;
  }
  get customCourses () {
    return this.courses.map (course => ({
      ...course,
      Quantity__c: 1,
      isUpdated: true,
      buttonIcon: '',
      totalPrice: course.Price__c,
    }));
  }

  connectedCallback () {
    this.courses = generateData ({amountOfRecords: 5});
  }
  handleGotocart (event) {
    this.courses = event.detail;
    this.isTrue = true;
  }
  handleGotoHome (event) {
    this.isTrue = false;
  }
}
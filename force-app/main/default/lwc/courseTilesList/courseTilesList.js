import {LightningElement, wire, track, api} from 'lwc';
import getPagedCourseList
  from '@salesforce/apex/courseraLwcController.getPagedCourseList';
import {
  publish,
  subscribe,
  unsubscribe,
  MessageContext,
} from 'lightning/messageService';
// import {NavigationMixin} from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import CUSTOMER_CHANNEL from '@salesforce/messageChannel/customerChangesMS__c';
// import COURSES_CHANNEL from '@salesforce/messageChannel/coursesChannel__c';
import SEARCHKEY_CHANNEL
  from '@salesforce/messageChannel/HeaderChangeChannel__c';

export default class CourseTilesList
  extends LightningElement {
  @track cart_items = [];
  @track records = [];

  @api pagesize;
  currCustomer;
  isSpinner = true;
  pageNumber = 1;
  searchKey = '';
  result = [];
  error;

  @wire (MessageContext)
  messageContext;

  @wire (getPagedCourseList, {
    searchKey: '$searchKey',
    pageSize: '$pagesize',
    pageNumber: '$pageNumber',
  })
  wiredCourses({error, data}) {
    if (data) {
      this.result = data;
      this.records = data.records.map (obj => ({...obj, isAdded: false}));
      this.hideSpinner ();
    } else if (error) {
      console.log (error);
    }
  }

  get courses () {
    return this.records.map (obj => {
      return this.check_inCart ('Id', obj.Id)
        ? {...obj, isAdded: true}
        : {...obj, isAdded: false};
    });
  }
  get addedItems () {
    return this.cart_items.length;
  }

  get totalPrice () {
    let total = 0;
    this.cart_items.forEach (ele => {
      total += ele.Price__c;
    });
    return total;
  }

  connectedCallback () {
    this.subscribetoLMS ();
  }

  disconnectedCallback () {
    unsubscribe (this.subscription1);
    this.subscription1 = null;
    unsubscribe (this.subscription2);
    this.subscription2 = null;
    unsubscribe (this.subscription3);
    this.subscription3 = null;
  }

  handlePreviousPage () {
    this.showSpinner ();
    this.pageNumber--;
  }

  handleNextPage () {
    this.showSpinner ();
    this.pageNumber++;
  }
  checkCustomer(){
    if (typeof this.currCustomer == 'undefined') {
          const event = new ShowToastEvent ({
          message: 'Please Select Contact!',
          variant: 'error',
        });
        this.dispatchEvent (event);
        return false;
    }return true;
  }
  checkCart(){
    if (this.cart_items.length == 0) {
    this.dispatchEvent (
      new ShowToastEvent ({
        message: 'Add some Items to cart!',
        variant: 'error',
      })
    );
    return false;
  }
  return true
  }
  handleGotoCart () {
    if(this.checkCustomer() && this.checkCart())
        this.dispatchEvent (
          new CustomEvent ('gotocart', {detail: this.cart_items})
        );
  }

  handleCheckAdd (event) {
    const course_tocheck = event.detail;
    const isExist = this.check_inCart ('Id', course_tocheck.Id);
    if (isExist) {
      this.template
        .querySelector (`[data-id="${course_tocheck.Id}"]`)
        .disableButton ();
    }
  }

  handleCourseAdd (event) {
    this.add_toCart (event.detail);
  }
  add_toCart (course_toadd) {

    this.cart_items.push (course_toadd);

    console.log ('cart_items - after : ', this.cart_items);
    // this.template.querySelector(`[data-id="${course_toadd.Id}"]`).disableButton();
    this.dispatchEvent (
      new ShowToastEvent ({
        message: 'Course added to Cart!',
        variant: 'success',
      })
    );
  }
  handleCourseDelete (event) {
    this.remove_fromCart (event.detail);
  }

  remove_fromCart (course_toremove) {
    this.cart_items = this.cart_items.filter (item => {
      return item.Id !== course_toremove.Id;
    });
    // this.template.querySelector(`[data-id="${course_toremove.Id}"]`).enableButton();
  }
  updateSearchkey (message) {
    this.showSpinner ();
    this.searchKey = message.newSearchkey;
    this.pageNumber = 1;
  }
  updateCustomer (message) {
    this.currCustomer = message.newCustomer;
  }

  subscribetoLMS () {
    this.subscription1 = subscribe (
      this.messageContext,
      SEARCHKEY_CHANNEL,
      message => {
        this.updateSearchkey (message);
      }
    );
    this.subscription2 = subscribe (
      this.messageContext,
      CUSTOMER_CHANNEL,
      message => {
        this.updateCustomer (message);
      }
    );
    /**
      this.subscription3 = subscribe (
        this.messageContext,
        COURSES_CHANNEL,
        message => {
          this.updateCourses (message);
        }
      );
      */
  }
  updateCourses (message) {
    this.cart_items = setTimeout (() => {
      alert ('Hello! I am an alert box!!');
      return message.courses_fromCart;
    }, 5000);
  }

  check_inCart (attr, value) {
    let arr = [...this.cart_items];
    var i = arr.length;
    while (i--) {
      if (
        arr[i]?.hasOwnProperty(attr) &&
        (arguments.length = 2 && arr[i][attr] === value)
      ) {
        return true;
      }
    }
    return false;
  }
  showSpinner () {
    this.isSpinner = true;
  }
  hideSpinner () {
    this.isSpinner = false;
  }
  /**
   * navigateTo () {
    this[NavigationMixin.Navigate] ({
      type: 'standard__component',
      attributes: {
        componentName: 'c__eLearning_Course_Management',
      },
      state: {
        records: this.cart_items,
        customer: this.currCustomer,
      },
    });
  }
   */
}
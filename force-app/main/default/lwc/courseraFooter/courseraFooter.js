import {api, wire, LightningElement} from 'lwc';
import CUSTOMER_CHANNEL from '@salesforce/messageChannel/customerChangesMS__c';
import {
  publish,
  subscribe,
  unsubscribe,
  MessageContext,
} from 'lightning/messageService';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

export default class CourseraFooter extends LightningElement {
  @api addeditems;
  @api totalamount;
  customer;

  @wire (MessageContext)
  messageContext;

  connectedCallback () {
    this.subscribetoLMS ();
  }
  handleGotoCart () {
    this.dispatchEvent (
      new CustomEvent ('gotocart', {detail: this.addeditems})
    );
  }

  subscribetoLMS () {
    this.subscription2 = subscribe (
      this.messageContext,
      CUSTOMER_CHANNEL,
      message => {
        this.updateCustomer (message);
      }
    );
  }
  updateCustomer (message) {
    this.customer = message.newCustomer;
  }
}
import {api, LightningElement, track, wire} from 'lwc';
import getAllCustomers
  from '@salesforce/apex/courseraLwcController.getAllCustomers';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {publish, MessageContext} from 'lightning/messageService';

import SEARCHKEY_CHANNEL
  from '@salesforce/messageChannel/HeaderChangeChannel__c';
import CUSTOMER_CHANNEL from '@salesforce/messageChannel/customerChangesMS__c';

export default class CourseraHeader extends LightningElement {
  searchKey = '';
  @track display = 'none;';
  currCustomer;
  customers = [];
  @api enableSearch () {
    this.template.querySelector ('lightning-input').disabled = false;
  }
  @api disableSearch () {
    this.template.querySelector ('lightning-input').disabled = true;
  }
  get displayStyle () {
    return 'padding-left: 7px; display : ' + this.display;
  }
  @wire (MessageContext)
  messageContext;

  connectedCallback () {
    this.fetchCustomers ();
  }

  handleCustomerChange (event) {
    try {
      this.currCustomer = event.detail.value;
      this.fireCustomerChange ();
      this.enableSearch ();
    } catch (error) {
      console.log (error.message);
    }
  }

  handleSearchClick (event) {
    if (this.isEmptyOrSpaces (this.searchKey)) {
      this.dispatchEvent (
        new ShowToastEvent ({
          message: 'Please Enter something to Search!',
          variant: 'error',
        })
      );
      return;
    }
    this.fireSearchkeyChange ();
    this.display = 'inline-block;';
    console.log (this.displayStyle);
  }
  handleClearClick (event) {
    this.display = 'none;';
    this.searchKey = '';
    this.fireSearchkeyChange ();
  }
  isEmptyOrSpaces (str) {
    return str === null || str.match (/^ *$/) !== null;
  }
  handleKeyChange (event) {
    this.searchKey = event.detail.value;
  }

  fetchCustomers () {
    getAllCustomers ()
      .then (data => {
        this.customers = data.map (record => ({
          value: record.Id,
          label: record.Name,
        }));
      })
      .catch (error => {
        console.log ('Error at getAllCustomers', error.body.message);
      });
  }

  fireSearchkeyChange () {
    try {
      const changes = {
        newSearchkey: this.searchKey,
      };

      publish (this.messageContext, SEARCHKEY_CHANNEL, changes);
    } catch (err) {
      console.log (err.message);
    }
  }

  fireCustomerChange () {
    try {
      const changes = {
        newCustomer: this.currCustomer,
      };
      publish (this.messageContext, CUSTOMER_CHANNEL, changes);
    } catch (error) {
      console.log (error.message);
    }
  }
}
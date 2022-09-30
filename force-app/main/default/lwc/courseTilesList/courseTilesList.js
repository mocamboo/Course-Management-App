import { LightningElement, wire, track } from 'lwc';
import getPagedCourseList from '@salesforce/apex/courseraLwcController.getPagedCourseList';
import getCourses from '@salesforce/apex/courseraLwcController.getCourses';
import {
    publish,
    subscribe,
    unsubscribe,
    MessageContext
} from 'lightning/messageService';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


import CUSTOMER_CHANNEL from '@salesforce/messageChannel/customerChangesMS__c';
import SEARCHKEY_CHANNEL from '@salesforce/messageChannel/HeaderChangeChannel__c';

const PAGE_SIZE = 6;

export default class CourseTilesList extends NavigationMixin(
    LightningElement
) {
    @track cart_items = [];
    @track records = [];


    currCustomer;
    pageNumber = 1;
    pageSize = PAGE_SIZE;
    searchKey = '';
    maxPrice = 9999;
    result = [];
    error;

    //LMS 
    @wire(MessageContext)
    messageContext;



    @wire(getPagedCourseList, {
        searchKey: '$searchKey',
        maxPrice: '$maxPrice',
        pageSize: '$pageSize',
        pageNumber: '$pageNumber'
    })
    wiredCourses({ error, data }) {
        if (data) {
            this.result = data;
            this.records = data.records.map((obj) => ({ ...obj, isAdded: false }));

        } else if (error) {
            console.log(error);
        }
    }

    get courses() {
        return this.records.map((obj) => {
            console.log('triggered');
            return this.check_inCart('Id', obj.Id) ? { ...obj, isAdded: true } : { ...obj, isAdded: false };
        });
    }
    get addedItems() {
        console.log(this.cart_items.length);
        return this.cart_items.length;
    }
    get totalPrice() {
        let total = 0;
        this.cart_items.forEach((ele) => {
            total += ele.Price__c;
        });
        return total;
    }

    connectedCallback() {
        this.subscribetoLMS();
    }



    disconnectedCallback() {
        unsubscribe(this.subscription1);
        this.subscription1 = null;
        unsubscribe(this.subscription2);
        this.subscription2 = null;
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }

    handleGotoCart() {
        try {
            if (this.cart_items.length == 0) {
                this.dispatchEvent(new ShowToastEvent({ message: 'Add some Items to cart!', variant: 'error' }));
            } else {

                this.dispatchEvent(new CustomEvent('gotocart', { detail: this.cart_items }));

            }
        } catch (err) {
            console.log(err.message);
        }
    }

    handleNoCustomer() {
        // Show Toast Event
    }
    handleCheckAdd(event) {
        const course_tocheck = event.detail;
        const isExist = this.check_inCart('Id', course_tocheck.Id);
        if (isExist) {
            this.template.querySelector(`[data-id="${course_tocheck.Id}"]`).disableButton();
        }
    }

    handleCourseAdd(event) {
        if (typeof this.currCustomer == 'undefined') {
            this.dispatchEvent(new ShowToastEvent({ message: 'Please Select Contact!', variant: 'error' }));
            return;
        }
        this.add_toCart(event.detail);
    }
    add_toCart(course_toadd) {
        console.log('cart_items - before : ', this.cart_items);

        this.cart_items.push(course_toadd);


        console.log('cart_items - after : ', this.cart_items);
        // this.template.querySelector(`[data-id="${course_toadd.Id}"]`).disableButton();
        this.dispatchEvent(new ShowToastEvent({
            message: 'Course added to Cart!',
            variant: 'success'
        }));
    }
    handleCourseDelete(event) {
        this.remove_fromCart(event.detail);
    }

    remove_fromCart(course_toremove) {
        this.cart_items = this.cart_items.filter((item) => {
            return item.Id !== course_toremove.Id
        })
        // this.template.querySelector(`[data-id="${course_toremove.Id}"]`).enableButton();
    }
    handleSearchkeyChange(changes) {
        this.searchKey = changes.newSearchkey;
        this.pageNumber = 1;
    }
    handleCustomerChange(changes) {
        try {
            this.currCustomer = changes.newCustomer;
        }
        catch (err) {
            console.log(err.message);
        }
    }

    subscribetoLMS() {
        this.subscription1 = subscribe(
            this.messageContext,
            SEARCHKEY_CHANNEL,
            (message) => {
                this.handleSearchkeyChange(message);
            }
        );
        this.subscription2 = subscribe(
            this.messageContext,
            CUSTOMER_CHANNEL,
            (message) => {
                this.handleCustomerChange(message);
            }

        );
    }


    navigateTo() {
        this[NavigationMixin.Navigate]({
            type: "standard__component",
            attributes: {
                componentName: "c__eLearning_Course_Management"
            },
            state: {
                records: this.cart_items,
                customer: this.currCustomer
            }
        });
    }


    check_inCart(attr, value) {
        let arr = [...this.cart_items];

        var i = arr.length;
        while (i--) {
            if (arr[i]
                && arr[i].hasOwnProperty(attr)
                && (arguments.length = 2 && arr[i][attr] === value)) {
                console.log('item in the cart');
                return true;

            }
        }
        console.log('item NOT in the cart');
        return false;
    }
}
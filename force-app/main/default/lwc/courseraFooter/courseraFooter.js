import { api, LightningElement } from 'lwc';

export default class CourseraFooter extends LightningElement {
    @api addeditems;
    @api totalamount;

    handleGotoCart(){
        this.dispatchEvent(new CustomEvent('gotocart', { detail: this.addeditems }));
    }

}
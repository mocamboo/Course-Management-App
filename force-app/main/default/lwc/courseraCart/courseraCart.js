import { api, LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ORDER_OBJECT from '@salesforce/schema/Order__c';
import ORDER_OBJECT_Relationship from '@salesforce/schema/Order__c.Customer__c';
import ORDERDCOURSES_OBJECT from '@salesforce/schema/Ordered_Courses__c';
import COURSE_REL_FIELD from '@salesforce/schema/Ordered_Courses__c.Course__c';
import ORDER_REL_FIELD from '@salesforce/schema/Ordered_Courses__c.Order__c';
import QUANTITY_FIELD from '@salesforce/schema/Ordered_Courses__c.Quantity__c';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';


const actions = [
    { label: 'Add', name: 'add' }
];

const columns = [
    { label: 'Course Id', fieldName: 'Id' },
    { label: 'Course Name', fieldName: 'Name' },
    { label: 'Category', fieldName: 'Category__c' },
    { label: 'Price', fieldName: 'Price__c', type: 'currency' },
    {
        label: 'Quantity', fieldName: 'Quantity__c', type: 'quantityPicklist', editable: false,
        typeAttributes: {
            label: 'quantityPicklist',
            options: [
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 4, label: '4' },
                { value: 5, label: '5' },
            ],
            value: { fieldName: 'Quantity__c' },
            context: { fieldName: 'Id' }
        }
    },
    { label: 'Hours', fieldName: 'Hours__c' },
];



export default class CourseraCart extends NavigationMixin(
    LightningElement
) {

    @api courses = [];//custom courses with extra fields
    columns = columns;
    @track finalCart = [];

    orderId;
    idCourseMap = [];
    showSpinner = false;
    @track draftValues = [];
    lastSavedData = [];
    // saveDraftValues = [];


    get tabledata() {
        return [...this.courses.values()];
    }
    get totalAmount() {
        let total = 0;
        this.finalCart.forEach(item => {
            total += item.Price__c;
        });
        return total;
    }
    get itemsCount() {
        return this.finalCart.length;
    }

    constructor() {
        super();
        this.columns = this.columns.concat([
            { type: 'action', typeAttributes: { rowActions: this.getRowActions } }
        ]);
    }

    handleSave(event) {

        this.showSpinner = true;
        const saveDraftValues = JSON.parse(JSON.stringify(this.draftValues));

        for (const draft of saveDraftValues) {
            this.courses.get(draft.Id).Quantity__c = draft.Quantity__c;
        }
        this.draftValues = [];
        this.showSpinner = false;
        return this.refresh();

    }



    handleCancel(event) {
        //remove draftValues & revert data changes
        this.data = JSON.parse(JSON.stringify(this.lastSavedData));
        this.draftValues = [];

    }
    picklistChanged(event) {

        event.stopPropagation();
        let dataRecieved = event.detail.data;
        let updatedItem = { Id: dataRecieved.context, Quantity__c: dataRecieved.value };
        console.log(updatedItem);
        this.updateDraftValues(updatedItem);
        this.updateDataValues(updatedItem);
    }
    updateDataValues(updateItem) {

        let copyData = new Map(JSON.parse(JSON.stringify([...this.courses])));

        copyData.get(updateItem.Id).Quantity__c = updateItem.Quantity__c

        this.courses = copyData;

    }
    updateDraftValues(updateItem) {
        let draftValueChanged = false;
        let copyDraftValues = [...this.draftValues];
        //store changed value to do operations
        //on save. This will enable inline editing &
        //show standard cancel & save button
        copyDraftValues.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
                draftValueChanged = true;
            }
        });

        if (draftValueChanged) {
            this.draftValues = [...copyDraftValues];
        } else {
            this.draftValues = [...copyDraftValues, updateItem];
        }
    }

    handleCellChange(event) {
        this.updateDraftValues(event.detail.draftValues[0]);
    }
    getRowActions(row, doneCallback) {
        const actions = [];
        actions.push({
            'label': 'Add',
            'name': 'add'
        });
        //write for delete by checking necesaary requirements
        setTimeout(() => {
            doneCallback(actions);
        }, 200);

    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'add':
                this.add_toCart(row);
                break;
            default:
        }
    }

    add_toCart(row) {
        this.finalCart.push(row);
        console.log(new Map(JSON.parse(JSON.stringify([...this.courses]))));
    }

    handleConfirmation() {
        this.createOrder();
    }


    createOrder() {
        const fields = {};
        fields[ORDER_OBJECT_Relationship.fieldApiName] = '0035i00000E1xYXAAZ';
        const recordInput = { apiName: ORDER_OBJECT.objectApiName, fields };
        createRecord(recordInput)
            .then(order => {
                this.orderId = order.id
                this.createJunctions(order);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error',
                    }),
                );
            });
    }

    createJunctions(order) {
        if (this.finalCart.length > 0) {
            const recordInputs = this.finalCart.slice().map(course => {
                const recordInput = {
                    apiName: ORDERDCOURSES_OBJECT.objectApiName,
                    fields: {
                        [ORDER_REL_FIELD.fieldApiName]: this.orderId,
                        [COURSE_REL_FIELD.fieldApiName]: course.Id,
                        [QUANTITY_FIELD.fieldApiName]: course.Quantity__c,
                    }
                };
                return recordInput;
            });
            const promises = recordInputs.map(recordInput => createRecord(recordInput));
            Promise.all(promises).then(res => {
                this.showOrderSuccess(order)
                return this.refresh();
            }).catch(error => {
                console.log(error);
                this.showToast('Error', 'An Error Occured!!', 'error', 'dismissable');
            });
        }
    }

    showToast(title, message, variant, mode) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    }

    async refresh() {
        await refreshApex(this.courses);
    }

    showOrderSuccess(order) {
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.orderId,
                actionName: 'view',
            },
        }).then((url) => {
            const event = new ShowToastEvent({
                title: 'Success!',
                variant: 'success',
                message: 'Order {0} created! See it {1}!',
                messageData: [
                    order.Name,
                    {
                        url,
                        label: 'here',
                    },
                ],
            });
            this.dispatchEvent(event);
        });
    }

    check_inCart(courseId) {

    }
}



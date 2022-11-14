import {api, LightningElement, track} from 'lwc';
import {createRecord} from 'lightning/uiRecordApi';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import ORDER_OBJECT from '@salesforce/schema/Order__c';
import ORDER_OBJECT_Relationship from '@salesforce/schema/Order__c.Customer__c';
import ORDERDCOURSES_OBJECT from '@salesforce/schema/Ordered_Courses__c';
import COURSE_REL_FIELD from '@salesforce/schema/Ordered_Courses__c.Course__c';
import ORDER_REL_FIELD from '@salesforce/schema/Ordered_Courses__c.Order__c';
import QUANTITY_FIELD from '@salesforce/schema/Ordered_Courses__c.Quantity__c';
import {NavigationMixin} from 'lightning/navigation';
import COURSES_CHANNEL from '@salesforce/messageChannel/coursesChannel__c';

const columns = [
  {label: 'Course Name', fieldName: 'Name', initialWidth: 400},
  {label: 'Category', fieldName: 'Category__c', initialWidth: 170},
  {label: 'Hours', fieldName: 'Hours__c', initialWidth: 170},
  {label: 'Price', fieldName: 'Price__c', type: 'currency', initialWidth: 170},
  {
    label: 'Quantity',
    initialWidth: 320,
    fieldName: 'Quantity__c',
    type: 'quantityPicklist',
    editable: false,
    typeAttributes: {
      label: 'quantityPicklist',
      options: [
        {value: 1, label: '1'},
        {value: 2, label: '2'},
        {value: 3, label: '3'},
        {value: 4, label: '4'},
        {value: 5, label: '5'},
        {value: 6, label: '6'},
        {value: 7, label: '7'},
        {value: 8, label: '8'},
        {value: 9, label: '9'},
        {value: 10, label: '10'},
      ],
      value: {fieldName: 'Quantity__c'},
      context: {fieldName: 'Id'},
    },
  },
  {label: 'Total Price', fieldName: 'totalPrice', type: 'currency'},
];

export default class CourseraCart extends NavigationMixin (LightningElement) {
  @api courses = [];

  columns = columns;
  @track copyCart = [];
  orderId;
  @track showSpinner = false;
  @track draftValues = [];

  get tabledata () {
    return this.courses;
  }
  get itemsCount () {
    let total_courses = 0;

    this.copyCart.forEach (course => {
      total_courses += course.Quantity__c;
    });

    return total_courses;
  }
  get totalAmount () {
    let total_amount = 0;

    this.copyCart.forEach (course => {
      total_amount += course.totalPrice;
    });

    return total_amount;
  }
  connectedCallback () {
    this.copyCart = [...this.courses];
  }
  constructor () {
    super ();

    //Dynamic Row-action
    this.columns = this.columns.concat ([
      {
        fixedWidth: 70,
        type: 'action',
        typeAttributes: {
          rowActions: this.getRowActions,
        },
        cellAttributes: {
          iconName: {fieldName: 'buttonIcon'},
          iconPosition: 'right',
        },
      },
    ]);
  }

  handleSave (event) {
    const copyData = JSON.parse (JSON.stringify (this.courses));

    const coursesMap = new Map (
      copyData.map (object => {
        return [object.Id, object];
      })
    );

    const drafts = [...this.draftValues];

    for (const draft of drafts) {
      coursesMap.get (draft.Id).Quantity__c = parseInt (draft.Quantity__c);
      coursesMap.get (draft.Id).isUpdated = false;
      coursesMap.get (draft.Id).buttonIcon = 'utility:info';
      coursesMap.get (draft.Id).totalPrice =
        draft.Quantity__c * coursesMap.get (draft.Id).Price__c;
    }

    this.courses = [...coursesMap.values ()];

    this.draftValues = [];
  }
  handleSave2 (updatedItem) {
    const copyData = JSON.parse (JSON.stringify (this.courses));
    copyData.forEach ((course, index) => {
      if (course.Id === updatedItem.Id) {
        copyData[index].Quantity__c = parseInt (updatedItem.Quantity__c);
        copyData[index].isUpdated = false;
        copyData[index].buttonIcon = 'utility:info';
        copyData[index].totalPrice = updatedItem.Quantity__c * course.Price__c;
      }
    });

    this.courses = [...copyData];
  }
  handleCancel (event) {
    const copyData = [...this.courses];

    this.courses = copyData;
    this.draftValues = [];
  }
  picklistChanged (event) {
    try {
      event.stopPropagation ();
      let dataRecieved = event.detail.data;
      let updatedItem = {
        Id: dataRecieved.context,
        Quantity__c: dataRecieved.value,
      };
      // this.add_toCart ();
      this.handleSave2 (updatedItem);
    } catch (error) {
      console.log (error.message);
    }
    // this.updateDraftValues (updatedItem);
  }
  updateDraftValues (updateItem) {
    let draftValueChanged = false;
    let copyDraftValues = [...this.draftValues];

    copyDraftValues.forEach (item => {
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

  handleCellChange (event) {
    this.updateDraftValues (event.detail.draftValues[0]);
  }

  getRowActions (row, callBack) {
    try {
      const actions = [];
      if (!row.isUpdated) {
        actions.push ({
          label: 'Update',
          name: 'add',
        });
      } else {
        actions.push ({
          label: 'Delete',
          name: 'delete',
        });
      }

      setTimeout (() => {
        callBack (actions);
      }, 100);
    } catch (error) {
      console.log (error.message);
    }
  }

  handleRowAction (event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;
    switch (actionName) {
      case 'add':
        this.add_toCart (row);
        break;
      case 'delete':
        this.delete_Item (row);
        break;

      default:
        break;
    }
  }
  delete_Item (row) {
    this.delete_fromTable (row);
    this.delete_fromCart (row);
    const event = new ShowToastEvent ({
      title: 'Removed!',
      variant: 'warning',
    });
    this.dispatchEvent (event);
    return;
  }
  add_toCart (row) {
    let copyData = [...this.copyCart];

    this.copyCart = copyData.map (course => {
      if (course.Id == row.Id) {
        return {
          ...course,
          Quantity__c: row.Quantity__c,
          totalPrice: row.totalPrice,
        };
      }
      return course;
    });

    const copyCourses = JSON.parse (JSON.stringify (this.courses));
    copyCourses.forEach ((course, index) => {
      if (course.Id == row.Id) {
        copyCourses[index].isUpdated = true;
        copyCourses[index].buttonIcon = '';
        console.log ('updated copycourses');
      }
    });
    this.courses = [...copyCourses];

    const event = new ShowToastEvent ({
      title: 'Quantity Updated!',
    });
    this.dispatchEvent (event);
  }
  delete_fromTable (row) {
    let copyData = JSON.parse (JSON.stringify ([...this.courses]));
    const index = copyData.findIndex (course => course.Id === row.Id);

    if (index > -1) {
      copyData.splice (index, 1);
    }
    this.courses = [...copyData];
  }
  delete_fromCart (row) {
    let copyData2 = JSON.parse (JSON.stringify ([...this.copyCart]));
    let index2 = copyData2.findIndex (course => course.Id === row.Id);

    if (index2 > -1) {
      copyData2.splice (index2, 1);
    }
    this.copyCart = [...copyData2];
  }
  handleConfirmation () {
    this.showSpinner = true;
    this.createOrder ();
  }

  createOrder () {
    const fields = {};
    fields[ORDER_OBJECT_Relationship.fieldApiName] = '0035i00000E1xYXAAZ';
    const recordInput = {apiName: ORDER_OBJECT.objectApiName, fields};
    createRecord (recordInput)
      .then (order => {
        this.orderId = order.id;
        this.createJunctions (order);
      })
      .catch (error => {
        this.dispatchEvent (
          new ShowToastEvent ({
            title: 'Error creating record',
            message: error.body.message,
            variant: 'error',
          })
        );
      });
  }

  createJunctions (order) {
    const recordInputs = this.copyCart.slice ().map (course => {
      return {
        apiName: ORDERDCOURSES_OBJECT.objectApiName,
        fields: {
          [ORDER_REL_FIELD.fieldApiName]: this.orderId,
          [COURSE_REL_FIELD.fieldApiName]: course.Id,
          [QUANTITY_FIELD.fieldApiName]: course.Quantity__c,
        },
      };
    });
    const promises = recordInputs.map (recordInput =>
      createRecord (recordInput)
    );
    Promise.all (promises)
      .then (res => {
        // this.showOrderSuccess (order);
        this.navigateToOrderRec ();
      })
      .catch (error => {
        const event = new ShowToastEvent ({
          title: 'Error!',
          variant: 'error',
          message: error.body.message,
        });
        this.dispatchEvent (event);
      });
  }
  handleBack () {
    this.publishCourses ();
    this.dispatchEvent (new CustomEvent ('gotohome', {detail: this.courses}));
  }
  // showOrderSuccess (order) {
  //   this[NavigationMixin.GenerateUrl] ({
  //     type: 'standard__recordPage',
  //     attributes: {
  //       recordId: this.orderId,
  //       actionName: 'view',
  //     },
  //   }).then (url => {
  //     const event = new ShowToastEvent ({
  //       title: 'Success!',
  //       variant: 'success',
  //       message: 'Order {0} created! See it {1}!',
  //       messageData: [
  //         order.Name,
  //         {
  //           url,
  //           label: 'here',
  //         },
  //       ],
  //     });
  //     this.showSpinner = false;
  //     this.dispatchEvent (event);
  //   });
  // }
  publishCourses () {
    const changes = {
      courses_fromCart: this.copyCart,
    };

    publish (this.messageContext, COURSES_CHANNEL, changes);
  }
  navigateToOrderRec () {
    this[NavigationMixin.Navigate] ({
      type: 'standard__recordPage',
      attributes: {
        recordId: this.orderId,
        objectApiName: ORDER_OBJECT,
        actionName: 'view',
      },
    });
  }
}

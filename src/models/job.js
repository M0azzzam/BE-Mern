import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

/**
 * #casual items - item that are direct line items of a job
 * #time expense - item that calculates the cost based on hours spent
 * #expense against casual item - item that refers to the line item or in-house cost keeping
 */

const jobSchema = new Schema({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  jobId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  jobType: {
    type: String,
    enum: ['non-recurring', 'recurring'],
    default: 'non-recurring'
  },
  serviceAddress: {
    type: Object,
  },
  status: {
    type: String,
    enum: ['scheduled', 'unscheduled', 'inprogress', 'completed', 'onhold', 'cancelled', 'no-invoice'],
    default: 'unscheduled'
  },
  expenses: [{
    chargeType: {
      type: String,
      enum: ['time-expense', 'expense-against-casual-items', 'casual'],
      default: 'casual'
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    technician: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    description: String,
    date: Date,
    purchaseOrder: String,
    receipt: String,
    paymentType: {
      type: String,
      enum: ['cash', 'credit-card']
    },
    qty: Number,
    amount: Number,   //amount is actually cost price of item
    chargeToCustomer: {
      type: Boolean,
      default: false   //its value effect only for time-expense and expense against casual items
    },
    lineItem: {
      item: {
        type: Schema.Types.ObjectId,
        ref: 'Inventory'
      },
      description: String,    //Description === Notes if chargeType === time-expense
      unitCost: Number,
      qty: Number
    }
  }],
  technicians: [{
    technician: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['on-way']
    },
    checkIn: Date,
    checkOut: Date,
    timeLogs: [{ checkIn: Date, checkOut: Date }]
  }],
  // preferences: {
  //   hourlyRate: Number,
  //   labourFee: Number
  // },
  schedule: [{
    title: String,
    instructions: String,
    startDateTime: Date,
    endDateTime: Date,
    assignedTo: [{
      technician: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  }],
  attachments: [{
    fileName: String,
    mimeType: String,
    location: String
  }],
  reminder: {
    type: {
      type: String,
      enum: ['call', 'email', 'visit'],
      default: 'call'
    },
    subject: String,
    dateTime: Date,
    assignedTo: [{
      technician: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    comments: String
  },
  internalNotes: {
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    via: {
      type: String,
      enum: ['sms', 'email']
    },
    subject: String,
    comments: String
  },
  clientsPreferences: {
    to: {
      type: Schema.Types.ObjectId,
      ref: 'Client'
    },
    via: {
      type: String,
      enum: ['sms', 'email']
    },
    subject: String,
    message: String
  },
  preJobTechnicianReminder: {
    // before 1 hour of JOB
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  preJobCustomerReminder: {
    // before 1 hour of JOB
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  notifyCustmer: {
    // techStatus === OnWay
    sms: {
      type: Boolean,
      default: false
    },
    email: {
      type: Boolean,
      default: false
    }
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, skipVersioning: true })

export default tenantModel('Job', jobSchema)

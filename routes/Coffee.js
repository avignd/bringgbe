const express = require('express');
const router = express.Router();
const config = require('../config');
const BringgService = require('../services/BringgService');
const Customer = require('../model/Customer');

router.post('/', function(req, res, next) {
    if(!req.body.name || !req.body.address || !req.body.phone || !req.body.email) {
        res.status = 400;
        res.send('Validation failed');
    }

    let customer = new Customer(req.body.name, req.body.address, req.body.phone, req.body.email);
    let customerDetails = BringgService.requestBringgApi(config.createCusomterUrl, customer, 'POST');

    if(customerDetails && customerDetails.success) {
        let taskParams = {};
        taskParams.customer_id = customerDetails.customer.id;
        taskParams.title = 'Order coffee';
        taskParams.address = customer.address;

        let taskDetails = BringgService.requestBringgApi(config.taskUrl, taskParams, 'POST');
        if(taskDetails && taskDetails.success) {
            res.send('your coffee is on the way!');
        }
    }
    res.send('An error has occurred :(');
});

router.post('/orders', function(req, res, next) {
    if(!req.body.phone){
        res.status = 400;
        res.send('Validation failed');
    }

    let taskParams = {};
    taskParams.company_id = config.companyId;
    taskParams.page = 1;
    let tasks = BringgService.requestBringgApi(config.taskUrl, taskParams, 'GET');
    let unionTask = tasks.slice();

    while(tasks.length === config.pageMax){
        let newTaskParams = {};
        newTaskParams.company_id = config.companyId;
        newTaskParams.page = ++taskParams.page;

        tasks = BringgService.requestBringgApi(config.taskUrl, newTaskParams, 'GET');
        if(tasks) {
            unionTask = unionTask.concat(tasks);
        }
        else{
            res.send('An error has occurred :(');
            break;
        }
    }
    if (unionTask) {
        let compareDate = new Date();
        compareDate.setDate(compareDate.getDate() - 7);

        let customerTaskFromLastWeek = unionTask.filter(t => {
            if(new Date(t.created_at) > compareDate && t.customer.phone === req.body.phone){
                return t;
            }
        });

        res.send(customerTaskFromLastWeek);
    }
    res.send('An error has occurred :(');
});

module.exports = router;
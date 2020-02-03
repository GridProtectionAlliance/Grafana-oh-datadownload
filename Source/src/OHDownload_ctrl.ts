//******************************************************************************************************
//  OHDowload_ctrl.ts - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  02/03/2020 - C.Lackner
//       Generated original version of source code.
//
//******************************************************************************************************


//<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk';
import * as moment from "moment";

//import { varName } from '../js/constants'   // import constants from constant file using this format

export class OHDownloadCtrl extends MetricsPanelCtrl{
    static templateUrl: string = 'partials/module.html';
    pointIDs: string[];
    fileLink: string;
    startTime: any;
    endTime: any;
    textSizeOptions: string[] = ['50%', '60%', '70%', '80%', '90%', '100%', '110%', '120%', '130%', '140%', '150%', '160%', '170%', '180%', '190%', '200%', '250%','300%'];

    constructor($scope, $injector, private $rootScope) {
        super($scope, $injector);
        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
        this.events.on('render', this.onRender.bind(this));
        this.events.on('panel-initialized', this.onPanelInitialized.bind(this));
        this.events.on('data-received', this.onDataRecieved.bind(this));
        //this.events.on('data-snapshot-load', console.log('data-snapshot-load'));
        this.events.on('data-error', this.onDataError.bind(this));
        this.events.on('refresh', this.onRefresh.bind(this));

        this.panel.link = (this.panel.link != undefined ? this.panel.link : '..');

        this.panel.rate = (this.panel.rate != undefined ? this.panel.rate : 30);
        this.panel.rateBase = (this.panel.rateBase != undefined ? this.panel.rateBase : 'frames per second'); 
        this.panel.firstTS = (this.panel.firstTS != undefined ? this.panel.firstTS : 'first available measurement');

        this.panel.alignTS = (this.panel.alignTS != undefined ? this.panel.alignTS : true);
        this.panel.exportNaN = (this.panel.exportNaN != undefined ? this.panel.exportNaN : true); 
        this.panel.missingTS = (this.panel.missingTS != undefined ? this.panel.missingTS : true); 
        this.panel.round = (this.panel.round != undefined ? this.panel.round : true); 

        this.panel.color = (this.panel.color != undefined ? this.panel.color : '#ff0000'); 
        this.panel.fontsize = (this.panel.fontsize != undefined ? this.panel.fontsize : '100%');
        

        this.fileLink = "";
        this.startTime = null;
        this.endTime = null;
    }

    // #region Events from Graphana Handlers
    onInitEditMode() {
        this.addEditorTab('Options', 'public/plugins/openhistorian-datadownload-panel/partials/editor.html', 2);
    }

    onPanelTeardown() {
        //console.log('panel-teardown');
    }

    onPanelInitialized() {
        //console.log('panel-initialized');
    }

    onRefresh() {
        //console.log('refresh');
    }

    onResize() {
        //console.log('refresh');
    }

    onRender() {
        //console.log('render');

    }

    onDataRecieved(data) {
        let ctrl = this;
        let promiseData: any[] = [];

        ctrl.pointIDs = [];  

        let minTS = Number.MAX_SAFE_INTEGER;
        let maxTS = Number.MIN_SAFE_INTEGER;

        data.forEach(point => {
            promiseData.push(this.datasource.getMetaData(point.target).then(function (metaData) {
                let jsonMetaData = JSON.parse(metaData.data);
                ctrl.pointIDs.push(jsonMetaData[0]["ID"]);

            }))

            if (point.datapoints.length > 0) {
                if (Math.min(...point.datapoints.map(item => item[1])) < minTS)
                    minTS = Math.min(...point.datapoints.map(item => item[1]))
                if (Math.max(...point.datapoints.map(item => item[1])) > maxTS)
                    maxTS = Math.max(...point.datapoints.map(item => item[1]))
            }
        })

        this.startTime = moment.utc(minTS);

        this.endTime = moment.utc(maxTS);

        Promise.all(promiseData).then(function () {
            ctrl.updateLink()
        });
    }

    onDataError(msg) {
        //console.log('data-error');
    }

    handleClick(d) {
        window.location.href = this.fileLink;
    }

    updateLink() {
        let framerate = this.panel.rate;

        if (this.panel.rateBase == 'frames per minute') {
            framerate = framerate / 60.0;
        }
        if (this.panel.rateBase == 'frames per hour') {
            framerate = framerate / (60.0 * 60.0);
        }

        let tolerance = 0.5;
        if (this.panel.round) {
            tolerance = 500 / framerate;
        }

        this.fileLink = this.panel.link + '\ExportDataHandler.ashx?PointIDs=' + '1544,1684' +
            "&StartTime=" + this.startTime.format("DD/MM/YYYY HH:mm:ss.000000") + "&EndTime=" + this.endTime.format("DD/MM/YYYY HH:mm:ss.000000") +
            "&FrameRate=" + framerate.toString() + "&AlignTimestamps=" + ((this.panel.alignTS) ? "true" : "false") +
            "&MissingAsNaNParam=" + ((this.panel.exportNaN) ? "true" : "false") +
            "&FillMissingTimestamps=" + ((this.panel.missingTS) ? "true" : "false") +
            "&InstanceName=" + "PPA" +
            "&TSSnap=" + this.formatTSSnap().toString() +
            "&TSTolerance=" + tolerance.toString();
    }

    formatTSSnap() {
        if (this.panel.firstTS == 'first available measurement')
            return 1
        return 2
    }
    // #endregion

}
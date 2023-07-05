﻿(function ($) {
    $.widget('pic.configInterfaces', {
        options: {},
        _create: function () {
            var self = this, o = self.options, el = self.element;
            self._buildControls();
        },
        _buildControls: function () {
            var self = this, o = self.options, el = self.element;
            el.addClass('picConfigCategory');
            el.addClass('cfgInterfaces');
            pnl = $('<div></div>').addClass('cfgInterfaces').appendTo(el);
            $.getApiService('/app/options/interfaces', null, function (opts, status, xhr) {
                console.log(opts);
                for (var i in opts.interfaces) {
                    $('<div></div>').appendTo(pnl).pnlInterfaces(opts)[0].dataBind(opts.interfaces[i], i);
                }
                var btnPnl = $('<div class="picBtnPanel btn-panel"></div>').appendTo(el);
                var btnAdd = $('<div></div>').appendTo(btnPnl).actionButton({ text: 'Add Interface', icon: '<i class="fas fa-plus" ></i>' });
                btnAdd.on('click', function (e) {
                    self._addInterface();
                });
            });

        },
        _createUploadBindingsDialog: function (interfaceDlg) {
            var self = this, o = self.options, el = self.element;
            var dlg = $.pic.modalDialog.createDialog('dlgUploadBackground', {
                message: 'Upload Bindings File',
                width: '470px',
                height: 'auto',
                title: 'Upload a Bindings File',
                buttons: [{
                    text: 'Upload File', icon: '<i class="fas fa-upload"></i>',
                    click: function () {
                        var bf = dataBinder.fromElement(dlg);
                        var useProxy = makeBool($('body').attr('data-apiproxy'));
                        var url = '/app/interfaceBindings/file';
                        var serviceUrl = useProxy ? '/njsPC' + (!url.startsWith('/') ? '/' : '') + url : $('body').attr('data-apiserviceurl') + (!url.startsWith('/') ? '/' : '') + url;
                        dlg.find('div.picFileUploader').each(function () {
                            this.upload({ url: serviceUrl, showProgress: true });
                        });
                    }
                },
                {
                    text: 'Cancel', icon: '<i class="far fa-window-close"></i>',
                    click: function () { $.pic.modalDialog.closeDialog(this); }
                }]
            });
            var line = $('<div>Select a valid interface bindings file to upload then click the upload file button to add it to the list available bindings.</div>').appendTo(dlg);
            $('<hr></hr>').appendTo(dlg);
            line = $('<div></div>').appendTo(dlg);
            $('<div></div>').appendTo(line).fileUpload({ binding: 'bindingsFile', showProgress: true, accept: '.json', labelText: 'Bindings File', inputAttrs: { style: { width: '24rem' } } })
                .on('changed', function (e) {
                    console.log(e);
                })
                .on('complete', function (e) {
                    $.getApiService('/app/options/interfaces', null, 'Loading Interface Options...', function (opts, status, xhr) {
                        interfaceDlg.find('#ddBindings')[0].items(opts.files);
                        $.pic.modalDialog.closeDialog(dlg);
                    });

                    //if (restoreDialog.length > 0) restoreDialog[0].loadRestoreFiles(e.fileData.filePath);
                });
            line = $('<div></div>').appendTo(div);
            dlg.css({ overflow: 'visible' });
        },
        _addInterface: function () {
            let self = this, o = self.options, el = self.element;
            $.getApiService('/app/options/interfaces', null, 'Loading Interface Options...', function (opts, status, xhr) {
                let dlg = $.pic.modalDialog.createDialog('dlgSelectControllerType', {
                    message: 'Add Interface',
                    width: '470px',
                    height: 'auto',
                    title: 'New Interface',
                    buttons: [
                        {
                            text: 'Add Interface', icon: '<i class="fas fa-save"></i>',
                            click: function () {
                                if (dataBinder.checkRequired(dlg)) {
                                    let iface = dataBinder.fromElement(dlg);
                                    console.log(iface);
                                    $.putApiService('/app/interfaces/add', iface, 'Adding Interface to configuration...', (defn, status, xhr) => {
                                        let lst = el.find('div.cfgInterfaces');
                                        opts.interfaces[defn.id] = defn.opts;
                                        $('<div></div>').appendTo(lst).pnlInterfaces(opts)[0].dataBind(defn.opts, defn.id);
                                        $.pic.modalDialog.closeDialog(this);
                                    });
                                }
                            }
                        },
                        {
                            text: 'Cancel', icon: '<i class="far fa-window-close"></i>',
                            click: function () { $.pic.modalDialog.closeDialog(this); }
                        }
                    ]
                });
                let line = $('<div></div>').appendTo(dlg);
                $('<div></div>').appendTo(line).addClass('status-text').css({ padding: '.5rem' }).text('Select the the file that contains the interface bindings from the dropdown.  If the file has not been uploaded to your njsPC server click the upload file button to upload it.');
                line = $('<div></div>').appendTo(dlg);
                $('<hr></hr>').appendTo(line);
                $('<div></div>').appendTo(line).inputField({ binding: 'name', labelText: 'Name', maxlength: 16, required: true, labelAttrs: { style: { width: '4rem' } } });
                $('<div></div>').appendTo(line).pickList({
                    required: true,
                    bindColumn: 0, displayColumn: 1, labelText: 'Type', binding: 'type',
                    columns: [{ binding: 'name', hidden: true, text: 'Code', style: { whiteSpace: 'nowrap' } }, { binding: 'desc', text: 'Type', style: { whiteSpace: 'nowrap' } }],
                    items: opts.types, inputAttrs: { style: { width: '5rem' } }, labelAttrs: { style: { marginLeft: '.25rem' } }
                }).on('selchanged', (evt) => {
                    ddBindings[0].required(evt.newItem.hasBindings);
                    if (evt.newItem.hasBindings) {
                        ddBindings.show();
                    }
                    else ddBindings.hide();
                });
                line = $('<div></div>').appendTo(dlg);
                let ddBindings = $('<div></div>').appendTo(line).pickList({
                    id: 'ddBindings',
                    binding: 'fileName',
                    labelText: 'Binding',
                    required: true,
                    bindColumn: 1, displayColumn: 0,
                    columns: [{ binding: 'name', text: 'Name', style: { whiteSpace: 'nowrap' } }, { binding: 'filename', text: 'Filename', style: { whiteSpace: 'nowrap' }, hidden: false }],
                    inputAttrs: { style: { width: '10rem' } },
                    labelAttrs: { style: { width: '4rem' } },
                    items: opts.files
                }).css({ marginRight: '.25rem' }).hide().on('selchanged', function (evt) {

                });

                var btnPnl = $('<div class="picBtnPanel btn-panel"></div>');
                btnPnl.appendTo(dlg);
                $('<div></div>').appendTo(btnPnl).actionButton({ text: 'Upload Bindings', icon: '<i class="fas fa-file-arrow-up"></i>' })
                    .on('click', function (e) {
                        self._createUploadBindingsDialog(dlg);
                    });
                dlg.css({ overflow: 'visible' });
            });
        }
    });
    $.widget('pic.pnlInterfaces', {
        options: {},
        _create: function () {
            var self = this, o = self.options, el = self.element;
            self._buildControls();
            el[0].dataBind = function (obj) { return self.dataBind(obj); };
        },
        _buildControls: function () {
            var self = this, o = self.options, el = self.element;
            el.empty();
            el.addClass('picAppCategory cfgAppInterfaces');
            var binding = '';
            var acc = $('<div></div>').appendTo(el).accordian({
                columns: [{ binding: 'name', glyph: 'fas fa-flask', style: { width: '14rem' } },
                { binding: 'type', glyph: '', style: {} }]
            });

            var pnl = acc.find('div.picAccordian-contents');
            var line = $('<div></div>').appendTo(pnl);
            $('<input type="hidden" data-datatype="string"></input>').attr('data-bind', 'uuid').appendTo(line);
            $('<div></div>').appendTo(line).inputField({ required: true, labelText: 'Name', binding: binding + 'name', inputAttrs: { maxlength: 32 }, labelAttrs: { style: {} } });
            $('<div></div>').appendTo(line).pickList({
                required: true,
                bindColumn: 0, displayColumn: 1, labelText: 'Type', binding: binding + 'type',
                columns: [{ binding: 'name', hidden: true, text: 'Code', style: { whiteSpace: 'nowrap' } }, { binding: 'desc', text: 'Type', style: { whiteSpace: 'nowrap' } }],
                items: o.types, inputAttrs: { style: { width: '5rem' } }, labelAttrs: { style: { marginLeft: '.25rem' } }
            });
            $('<div></div>').appendTo(line).checkbox({ labelText: 'Enabled', binding: 'enabled' });


            var grpConnection = $('<fieldset></fieldset>').css({ display: 'inline-block', verticalAlign: 'top' }).attr('id', 'grpConnection').appendTo(pnl);
            $('<legend></legend>').text('Connection').appendTo(grpConnection);
            line = $('<div></div>').appendTo(grpConnection);
            $('<div></div>').appendTo(line).pickList({
                canEdit: true,
                binding: binding + 'options.protocol',
                bindColumn: 1, displayColumn: 2,
                labelText: 'Protocol',
                columns: [{ binding: 'val', text: 'val', hidden: true }, { binding: 'name', text: 'name', hidden: true }, { binding: 'desc', text: 'Protocol Type', style: { whiteSpace: 'nowrap' } }],
                items: o.protocols,
                inputAttrs: { style: { width: '4rem' } },
                labelAttrs: { style: { marginLeft: '.25rem' } }
            });
            // $('<input type="hidden" data-datatype="int"></input>').attr('data-bind', 'id').appendTo(line);
            $('<div></div>').appendTo(line).inputField({ required: true, labelText: 'Host', binding: 'options.host', inputAttrs: { maxlength: 16, style: { width: '14rem' } }, labelAttrs: { style: { paddingLeft: '.15rem' } } });
            $('<div></div>').appendTo(line).inputField({ required: true, labelText: ':', binding: 'options.port', dataType: 'number', fmtMask: '#####', inputAttrs: { maxlength: 5, style: { width: '4rem' } }, labelAttrs: { style: { marginLeft: '.15rem' } } });
            var btnPnl = $('<div class="picBtnPanel btn-panel findButton"></div>');
            btnPnl.appendTo(grpConnection);


            $('<div></div>').appendTo(btnPnl).actionButton({ text: 'Find REM Controllers', icon: '<i class="fas fa-binoculars"></i>' })
                .on('click', function (e) {
                    var dlg = $.pic.modalDialog.createDialog('dlgFindREMServer', {
                        message: 'Searching for Controllers',
                        width: '400px',
                        height: 'auto',
                        title: 'Find REM Controller',
                        buttons: [{
                            text: 'Cancel', icon: '<i class="far fa-window-close"></i>',
                            click: function () { $.pic.modalDialog.closeDialog(this); }
                        }]
                    });
                    var line = $('<div></div>').appendTo(dlg);
                    var searchStatus = $('<div></div>').appendTo(line).css({ padding: '.5rem' }).addClass('status-text').addClass('picSearchStatus').text('Searching for running REM servers.');
                    line = $('<div></div>').appendTo(dlg);
                    $('<hr></hr>').appendTo(line);
                    line = $('<div></div>').css({ textAlign: 'center' }).appendTo(dlg);
                    dlg.css({ overflow: 'visible' });

                    $.getLocalService('/config/findREMControllers', null, 'Searching for Servers...', function (servers, status, xhr) {
                        if (servers.length > 0) {
                            searchStatus.text(servers.length + ' Running REM server(s) found.');
                            console.log(servers);
                            for (var i = 0; i < servers.length; i++) {
                                var server = servers[i];
                                var divSelection = $('<div></div>').addClass('picButton').addClass('REM').addClass('server').addClass('btn').css({ maxWidth: '227px', height: '97px', verticalAlign: 'middle', minWidth: '210px' }).appendTo(line);
                                $('<div></div>').addClass('body-text').css({ textAlign: 'center' }).appendTo(divSelection).append('<i class="fab fa-node-js" style="font-size:30pt;color:green;vertical-align:middle;"></i>').append('<span style="vertical-align:middle;"> REM Controller</span>');
                                var hostname = server.hostnames && typeof server.hostnames !== 'undefined' && server.hostnames.length === 1 ? server.hostnames[0] : server.hostname;
                                var ipadddress = server.hostname;
                                server.resolvedHost = hostname;
                                if (server.port && typeof server.port !== 'undefined' && !isNaN(server.port)) {
                                    hostname += `:${server.port}`;
                                    ipadddress += `:${server.port}`;
                                }

                                $('<div></div>').css({ textAlign: 'center', marginLeft: '1rem', marginRight: '1rem' }).appendTo(divSelection).text(hostname);
                                $('<div></div>').css({ textAlign: 'center', marginLeft: '1rem', marginRight: '1rem' }).appendTo(divSelection).text(ipadddress);
                                divSelection.data('server', server);
                                divSelection.on('click', function (e) {
                                    var srv = $(e.currentTarget).data('server');
                                    console.log({ msg: 'binding host', obj: { options: { host: srv.resolvedHost, port: srv.port, protocol: srv.protocol + '//' } } });
                                    dataBinder.bind(grpConnection, { options: { host: srv.resolvedHost, port: srv.port, protocol: srv.protocol + '//' } });
                                    $.pic.modalDialog.closeDialog(dlg[0]);
                                });
                            }
                        }
                        else {
                            searchStatus.text('No running REM servers could be found.  Enable SSDP on the REM application configuration.');
                        }
                    });
                });

            $('<hr></hr>').appendTo(pnl);
            $('<div></div>').appendTo(pnl).addClass('pnl-appSettings-type');

            btnPnl = $('<div class="picBtnPanel btn-panel"></div>').appendTo(pnl);
            var btnSave = $('<div></div>').appendTo(btnPnl).actionButton({ id: 'btnSave', text: 'Save Interface', icon: '<i class="fas fa-save"></i>' });
            btnSave.on('click', function (e) {
                var p = $(e.target).parents('div.picAccordian-contents:first');
                var v = dataBinder.fromElement(p);
                console.log(o.interfaces);
                var iface = {}; // capture any items not data bound
                for (var i in o.interfaces) {
                    if (o.interfaces[i].uuid === v.uuid) {
                        iface = o.interfaces[i];
                        break;
                    }
                }
                iface = $.extend(true, iface, v);
                if (dataBinder.checkRequired(p)) {
                    $.putApiService('/app/interface', iface, 'Saving interface...', function (c, status, xhr) {
                        console.log(c);
                        self.dataBind(c);
                    });
                }
            });
            var btnDelete = $('<div></div>').appendTo(btnPnl).actionButton({ id: 'btnDelete', text: 'Delete Interface', icon: '<i class="fas fa-trash"></i>' });
            btnDelete.on('click', function (e) {
                var p = $(e.target).parents('div.picAccordian-contents:first');
                var v = dataBinder.fromElement(p);
                let cfm = $.pic.modalDialog.createConfirm('dlgConfirmDeleteInterface', {
                    message: 'Are you sure you want to delete interface [' + v.name + ']?',
                    width: '350px',
                    height: 'auto',
                    title: 'Confirm Delete Interface',
                    buttons: [{
                        text: 'Yes', icon: '<i class="fas fa-trash"></i>',
                        click: function () {
                            var iface = dataBinder.fromElement(p);
                            $.deleteApiService('/app/interface', iface, 'Deleting Interface...', function (c, status, xhr) {
                                p.parents('div.picAppCategory.cfgAppInterfaces:first').remove();
                                $.pic.modalDialog.closeDialog(cfm);
                            });
                        }
                    },
                    {
                        text: 'No', icon: '<i class="far fa-window-close"></i>',
                        click: function () { $.pic.modalDialog.closeDialog(this); }
                    }]
                });
            });

        },
        dataBind: function (obj) {
            var self = this, o = self.options, el = self.element;
            var acc = el.find('div.picAccordian:first');
            var cols = acc[0].columns();
            cols[0].elText().text(obj.name);
            var type = o.types.find(elem => elem.name === obj.type);
            cols[1].elText().text(typeof type !== 'undefined' ? type.desc : 'Interface');
            // If the interface is enabled lets highlight the flask.
            if (!obj.enabled) cols[0].elGlyph().css({ color: 'silver' });
            else cols[0].elGlyph().css({ color: '' });
            var grp = el.find('#grpConnection:first');
            if (typeof type === 'undefined' || type.hasUrl === false) {
                grp.hide();
                grp.find('div.picPickList').each(function () { this.required(false); });
                grp.find('div.picInputField').each(function () { this.required(false) });
            }
            else {
                grp.show();
                grp.find('div.picPickList').each(function () { this.required(true); });
                grp.find('div.picInputField').each(function () { this.required(true) });
            }
            if (obj.isCustom === true) {
                el.find('#btnDelete').show();
            }
            else {
                el.find('#btnDelete').hide();
            }
            if (typeof obj.type !== 'undefined' && obj.type === 'rem') {
                el.find('div.findButton').show();
            }
            else {
                el.find('div.findButton').hide();
            }
            dataBinder.bind(el, obj);
        }
    });
})(jQuery);
(function ($) {  // Controller Type display.
    $.widget('pic.configControllerType', {
        options: {},
        _create: function () {
            var self = this, o = self.options, el = self.element;
            self._buildControls();
        },
        _buildControls: function () {
            var self = this, o = self.options, el = self.element;
            el.addClass('picConfigCategory');
            el.addClass('cfgControllerType');
            // Alright so now we need to allow the user to select a controller type but only if we are a 
            $.getApiService('/config/options/controllerType', null, function (opts, status, xhr) {
                console.log(opts);
                var type = opts.controllerTypes.find(elem => elem.type === opts.controllerType);
                var model = type.models.find(elem => elem.val === opts.equipment.modules[0].type);
                var line = $('<div></div>').appendTo(el);
                console.log(type);
                $('<input type="hidden" data-bind="controllerType"></input>').appendTo(line).val(opts.controllerType);
                $('<div></div>').staticField({ labelText: `Panel Type`, value: type.name }).appendTo(line);
                $('<div></div>').pickList({
                    required: true, value: opts.equipment.modules[0].type,
                    bindColumn: 0, displayColumn: 2, labelText: 'Model', binding: 'model',
                    columns: [{ binding: 'val', hidden: true, text: 'Id', style: { whiteSpace: 'nowrap' } }, { binding: 'name', hidden: false, text: 'Model', style: { whiteSpace: 'nowrap' } }, { binding: 'desc', text: 'Description', style: { whiteSpace: 'nowrap' } }],
                    items: type.models, inputAttrs: { style: { width: '9.7rem' } }, labelAttrs: { style: { marginLeft: '1rem' } }
                }).appendTo(line).on('selchanged', function (evt) {
                    self._setModelAttributes(evt.newItem);

                })[0].disabled(!makeBool(type.canChange));
                $('<div></div>').appendTo(el).addClass('ct-narrative');
                self._setModelAttributes(model);
                if (typeof opts.equipment.expansions !== 'undefined' && opts.equipment.expansions.length > 0 && type.type === 'intellitouch') {
                    for (let i = 0; i < opts.equipment.expansions.length; i++) {
                        line = $('<div></div>').appendTo(el);
                        $('<div></div>').pickList({
                            required: true,
                            value: opts.equipment.expansions[i].type,
                            bindColumn: 0, displayColumn: 2, labelText: `Expansion Module ${opts.equipment.expansions[i].id}`, binding: `expansion${opts.equipment.expansions[i].id}`,
                            columns: [{ binding: 'val', hidden: true, text: 'Id', style: { whiteSpace: 'nowrap', marginTop: '1rem' } }, { binding: 'name', hidden: false, text: 'Expansion', style: { whiteSpace: 'nowrap' } }, { binding: 'desc', text: 'Description', style: { whiteSpace: 'nowrap' } }],
                            items: type.expansionModules, inputAttrs: { style: { width: '9.7rem' } }, labelAttrs: { style: { marginLeft: '1rem' } }
                        }).appendTo(line);
                    }
                }

                if (type.canChange || typeof opts.equipment.expansions !== 'undefined' && opts.equipment.expansions.length > 0) {
                    btnPnl = $('<div class="picBtnPanel btn-panel"></div>').appendTo(el);
                    var btnSave = $('<div></div>').appendTo(btnPnl).actionButton({ text: 'Save Model', icon: '<i class="fas fa-save"></i>' });
                    btnSave.on('click', function (e) {
                        var v = dataBinder.fromElement(el);
                        console.log(v);
                        if (dataBinder.checkRequired(el)) {
                            $.putApiService('/config/controllerType', v, 'Saving Controller Type...', function (c, status, xhr) {

                            });
                        }
                    });
                }
            });
        },
        _setModelAttributes: function (model) {
            var self = this, o = self.options, el = self.element;
            var narr = el.find('div.ct-narrative');
            narr.empty();
            var bdy = model.shared || model.dual ? 'dual' : model.bodies === 0 ? 'zero' : 'single';
            $('<div></div>').appendTo(narr).html(`The ${model.desc} controller is a ${bdy} body controller.`);
            $('<hr></hr>').appendTo(narr);
            switch (bdy) {
                case 'zero':
                    $('<div></div>').appendTo(narr).html(`Zero body controllers provide no control over body features or filters.  As a result, features such as heaters, water temperature, and chemistry controllers are not defined for this type of controller.`);
                    break;
                case 'single':
                    $('<div></div>').appendTo(narr).html(`Single body controllers are capable of controlling only a single body of water.  For instance a stand-alone pool or spa.`);
                    break;
                case 'dual':
                    if (model.shared) {
                        $('<div></div>').appendTo(narr).html(`This controller is capable of controlling two bodies of water in a shared mode.  This gives you the capability of controlling a pool/spa, pool/pool, or spa/spa combination where there is shared equipment.  An intake and return valve is used to redirect the water through a single filter to the appropriate body depending on which mode is selected.`);
                    }
                    else {
                        $('<div></div>').appendTo(narr).html(`This controller is capable of controlling two bodies of water separately.  The bodies are separate and use their own filtration system and pumps.`);
                    }
                    break;
            }
        }

    });
    $.widget('pic.configRS485', {
        options: {},
        _create: function () {
            var self = this, o = self.options, el = self.element;
            self._buildControls();
            el[0].dataBind = function (obj) { return self.dataBind(obj); };
            el[0].setRS485Stats = function (stat) { return self.setRS485Stats(stat); };
        },
        setRS485Stats: function (stat) {
            var self = this, o = self.options, el = self.element;
            el.find('div.pnl-rs485Stats').each(function () {
                dataBinder.bind($(this), stat);
            });
        },
        _buildControls: function () {
            var self = this, o = self.options, el = self.element;
            el.addClass('picConfigCategory');
            el.addClass('cfgRS485');
            $.getApiService('/config/options/rs485', null, 'Getting Port Settings...', function (opts, status, xhr) {
                console.log(opts);
                for (let i = 0; i < opts.ports.length; i++) {
                    $('<div></div>').appendTo(el).configRS485Port({ ports: opts.local })[0].dataBind({ ...opts.ports[i] });
                }
                var btnPnl = $('<div class="picBtnPanel btn-panel"></div>').appendTo(el);
                var btnAdd = $('<div></div>').appendTo(btnPnl).actionButton({ text: 'Add RS485 Port', icon: '<i class="fas fa-plus" ></i>' });
                btnAdd.on('click', function (e) {
                    var pnl = $('<div></div>').insertBefore(btnPnl).configRS485Port({ ports: opts.local });
                    pnl[0].dataBind({ portId: -1 });
                    pnl.find('div.picAccordian:first')[0].expanded(true);
                });

            });
        },
        dataBind: function (obj) {
            var self = this, o = self.options, el = self.element;
            dataBinder.bind(el, obj);
        }
    });
    $.widget('pic.configRS485Port', {
        options: {},
        _create: function () {
            var self = this, o = self.options, el = self.element;
            self._buildControls();
            el[0].dataBind = function (obj) { return self.dataBind(obj); };
            el[0].setRS485Stats = function (stat) { return self.setRS485Stats(stat); };
        },
        setRS485Stats: function (stat) {
            var self = this, o = self.options, el = self.element;
            el.find('div.pnl-rs485Stats').each(function () {
                dataBinder.bind($(this), stat);
            });
        },
        _buildControls: function () {
            var self = this, o = self.options, el = self.element;
            el.addClass('picConfigCategory');
            el.addClass('cfgRS485Port');
            var acc = $('<div></div>').appendTo(el).accordian({
                columns: [{ binding: 'name', glyph: 'fas fa-route', style: { width: '14rem' } },
                { binding: 'type', glyph: '', style: { width: '14rem' } },
                { binding: 'name', glyph: '', style: { width: '7rem' } }]
            });
            var pnl = acc.find('div.picAccordian-contents');
            var divSettings = $('<div></div>').appendTo(pnl).addClass('pnl-rs485Port').css({ display: 'inline-block', verticalAlign: 'top', width: '22rem' });
            $('<input type="hidden" data-datatype="int"></input>').attr('data-bind', 'portId').appendTo(divSettings);
            var divStatus = $('<div></div>').appendTo(pnl).css({ display: 'inline-block', verticalAlign: 'top', paddingLeft: '1rem' });
            var line = $('<div></div>').appendTo(divSettings);
            var binding = '';
            $('<span></span>').addClass('mockCheck').checkbox({ labelText: 'Mock Port', binding: binding + 'mock' }).css({ display: 'none' }).appendTo(line);
            $('<div></div>').appendTo(line).checkbox({ labelText: 'Enabled', binding: binding + 'enabled' });
            let portTypes = [{ val: 'local', name: 'Local', desc: 'Local RS485 comm port' }, { val: 'netConnect', name: 'Network', desc: 'Network RS485 Port (SOCAT ...etc)' }, { val: 'screenlogic', name: 'ScreenLogic', desc: 'ScreenLogic TCP Connection' }, { val: 'mock', name: 'Mock Port', desc: 'Fake port and mock responses' }]
            $('<div></div>').appendTo(line).pickList({
                required: true,
                bindColumn: 0, displayColumn: 1, labelText: 'Port Type', binding: binding + 'type',
                columns: [{ binding: 'val', hidden: true, text: 'Id', style: { whiteSpace: 'nowrap' } }, { binding: 'name', hidden: false, text: 'Type', style: { whiteSpace: 'nowrap' } }, { binding: 'desc', text: 'Type', style: { whiteSpace: 'nowrap' } }],
                items: portTypes, inputAttrs: { style: { width: '7rem' } }, labelAttrs: { style: { marginLeft: '1rem' } }
            }).on('selchanged', function (evt) {
                var pnl = el;
                console.log(evt);
                if (typeof evt.newItem !== 'undefined') {
                    switch (evt.newItem.val) {
                        case 'network':
                        case 'netConnect':
                            pnl.find('div.pnl-rs485-network').show();
                            pnl.find('div.pnl-rs485-local').hide();
                            pnl.find('div.pnl-rs485-mock').hide();
                            pnl.find('div.pnl-rs485-inactivity').show();
                            pnl.find('div.pnl-screenlogic').hide();
                            pnl.find('div.pnl-rs485Stats').show();
                            break;
                        case 'mock':
                            pnl.find('div.pnl-rs485-network').hide();
                            pnl.find('div.pnl-rs485-local').hide();
                            pnl.find('div.pnl-rs485-mock').show();
                            pnl.find('div.pnl-rs485-inactivity').hide();
                            pnl.find('div.pnl-screenlogic').hide();
                            pnl.find('div.pnl-rs485Stats').show();
                            break;
                        case 'screenlogic':
                            pnl.find('div.pnl-rs485-network').hide();
                            pnl.find('div.pnl-rs485-local').hide();
                            pnl.find('div.pnl-rs485-mock').hide();
                            pnl.find('div.pnl-rs485-inactivity').hide();
                            pnl.find('div.pnl-screenlogic').show();
                            pnl.find('div.pnl-rs485Stats').hide();
                            break;
                        case 'local':
                        default:
                            pnl.find('div.pnl-rs485-network').hide();
                            pnl.find('div.pnl-rs485-local').show();
                            pnl.find('div.pnl-rs485-mock').hide();
                            pnl.find('div.pnl-rs485-inactivity').show();
                            pnl.find('div.pnl-screenlogic').hide();
                            pnl.find('div.pnl-rs485Stats').show();
                            break;
                    }
                }
                else {
                    pnl.find('div.pnl-rs485-network').hide();
                    pnl.find('div.pnl-rs485-local').show();
                    pnl.find('div.pnl-rs485-mock').hide();
                    pnl.find('div.pnl-rs485-inactivity').hide();
                    pnl.find('div.pnl-screenlogic').hide();
                    pnl.find('div.pnl-rs485Stats').hide();
                }
            });
            var divLocal = $('<div></div>').addClass('pnl-rs485-local').appendTo(divSettings).hide();
            line = $('<div></div>').appendTo(divLocal).addClass('pnlPortName');
            $('<div></div>').appendTo(line).pickList({
                canEdit: true,
                bindColumn: 0, displayColumn: 0, labelText: 'Port', binding: binding + 'rs485Port',
                columns: [{ binding: 'path', text: 'Port Name', style: { whiteSpace: 'nowrap', minWidth: '7rem', overflow: 'hidden', textOverflow: 'ellipsis' } }, { binding: 'manufacturer', hidden: false, text: 'Manufacturer', style: { whiteSpace: 'nowrap', minWidth: '15rem', maxWidth: '15rem', overflow: 'hidden', textOverflow: 'ellipsis' } }],
                items: o.ports, inputAttrs: { style: { width: '13.4rem' } }, labelAttrs: { style: { marginRight: '.25rem', textAlign: 'right', padding: '0px' } }
            });
            line = $('<div></div>').appendTo(divLocal);
            $('<div></div>').appendTo(line).pickList({
                required: true,
                bindColumn: 0, displayColumn: 1, labelText: 'Baud Rate', binding: binding + 'portSettings.baudRate', units: 'bps',
                columns: [{ binding: 'val', hidden: true, text: 'Id', style: { whiteSpace: 'nowrap' } }, { binding: 'name', hidden: false, text: 'Speed', style: { whiteSpace: 'nowrap' } }, { binding: 'desc', text: '', style: { whiteSpace: 'nowrap' } }],
                items: [
                    { val: 1200, name: '1,200', desc: '1,200 Baud' },
                    { val: 2400, name: '2,400', desc: '2,400 Baud' },
                    { val: 4800, name: '4,800', desc: '4,800 Baud' },
                    { val: 9600, name: '9,600', desc: '9,600 Baud (Default)' },
                    { val: 14400, name: '14,400', desc: '14,400 Baud' },
                    { val: 19200, name: '19,200', desc: '19,200 Baud' },
                    { val: 38400, name: '38,400', desc: '38,400 Baud' },
                    { val: 115200, name: '115,200', desc: '115,200 Baud' }
                ], inputAttrs: { style: { width: '5rem' } }, labelAttrs: { style: { marginRight: '.25rem', textAlign: 'right', width: '8.3rem', padding: '0px' } }
            });
            line = $('<div></div>').appendTo(divLocal);
            $('<div></div>').appendTo(line).valueSpinner({ canEdit: true, labelText: 'Data Bits', fmtMask: "#,##0", emptyMask: "---", binding: binding + 'portSettings.dataBits', min: 7, max: 8, step: 1, units: 'bits', inputAttrs: { maxlength: 5 }, labelAttrs: { style: { width: '8.3rem', marginRight: '.25rem', textAlign: 'right' } } });
            line = $('<div></div>').appendTo(divLocal);
            $('<div></div>').appendTo(line).pickList({
                required: true,
                bindColumn: 0, displayColumn: 1, labelText: 'Parity', binding: binding + 'portSettings.parity',
                columns: [{ binding: 'val', hidden: true, text: 'Id', style: { whiteSpace: 'nowrap' } }, { binding: 'name', hidden: false, text: 'Type', style: { whiteSpace: 'nowrap' } }, { binding: 'desc', text: 'Type', style: { whiteSpace: 'nowrap' } }],
                items: [
                    { val: 'none', name: 'None', desc: 'No Parity' },
                    { val: 'odd', name: 'Odd', desc: 'Bit padded so that every byte has an odd number of bits set' },
                    { val: 'even', name: 'Even', desc: 'Bit padded so that byte has an even number of bits set' }
                ], inputAttrs: { style: { width: '5rem' } }, labelAttrs: { style: { marginRight: '.25rem', textAlign: 'right', width: '8.3rem', padding: '0px' } }
            });
            line = $('<div></div>').appendTo(divLocal);
            $('<div></div>').appendTo(line).valueSpinner({ canEdit: true, labelText: 'Stop Bits', fmtMask: "#,##0", emptyMask: "---", binding: binding + 'portSettings.stopBits', min: 1, max: 2, step: 1, units: 'bits', inputAttrs: { maxlength: 5 }, labelAttrs: { style: { marginRight: '.25rem', textAlign: 'right', width: '8.3rem' } } });


            var divNet = $('<div></div>').addClass('pnl-rs485-network').appendTo(divSettings).hide();
            line = $('<div></div>').appendTo(divNet);
            $('<div></div>').appendTo(line).inputField({ labelText: 'Host', binding: 'netHost', inputAttrs: { maxlength: 22 }, labelAttrs: { style: { width: '3.5rem' } } });
            $('<div></div>').appendTo(line).inputField({ labelText: ':', binding: 'netPort', dataType: 'number', fmtMask: '#', inputAttrs: { maxlength: 7 }, labelAttrs: { style: { marginLeft: '.15rem' } } });
            line = $('<div></div>').appendTo(divNet);
            $('<div></div>').appendTo(line).checkbox({ labelText: 'Allow Half Open', binding: binding + 'netSettings.allowHalfOpen' });
            line = $('<div></div>').appendTo(divNet);
            $('<div></div>').appendTo(line).checkbox({ labelText: 'Keep Alive', binding: binding + 'netSettings.keepAlive' });
            line = $('<div></div>').appendTo(divNet);
            $('<div></div>').appendTo(line).valueSpinner({ canEdit: true, labelText: 'Initial Delay', fmtMask: "#,##0", binding: binding + 'netSettings.keepAliveInitialDelay', min: 0, max: 1000, step: 1, units: 'sec', inputAttrs: { maxlength: 5 }, labelAttrs: { style: { marginLeft: '3.2rem', marginRight: '.25rem' } } });

            line = $('<div></div>').appendTo(divSettings);
            $('<div></div>').addClass('pnl-rs485-inactivity').appendTo(line).valueSpinner({ canEdit: true, labelText: 'Inactivity Timeout', fmtMask: "#,##0", emptyMask: "---", binding: binding + 'inactivityRetry', min: 1, max: 1000, step: 1, units: 'sec', inputAttrs: { maxlength: 5 }, labelAttrs: { style: { width: '8.3rem', marginRight: '.25rem' } } });
            var divMock = $('<div></div>').addClass('pnl-rs485-mock').appendTo(divSettings).hide();
            line = $('<div></div>').appendTo(divMock);

            var divSL = $('<div></div>').addClass('pnl-screenlogic').appendTo(divSettings).hide();

            line = $('<div></div>').appendTo(divSL);


            // Create the statistics panel.
            $('<div></div>').appendTo(divStatus).css({ fontSize: '.8rem' }).configRS485PortStats();
            var btnPnl = $('<div class="picBtnPanel btn-panel"></div>').appendTo(pnl);
            var btnSave = $('<div></div>').appendTo(btnPnl).actionButton({ text: 'Save Port', icon: '<i class="fas fa-save" ></i>' });
            btnSave.on('click', function (evt) {
                $.pic.fieldTip.clearTips(divSettings);
                var p = dataBinder.fromElement(divSettings);
                console.log(p);
                if (p.portId === 0 && pnl.find('div.cfgRS485Port').length > 1 && p.type === 'screenlogic') {
                    // throw error
                    console.log(`Cannot have additional ports when using Screenlogic.`)
                }

                var obj = {};
                obj.enabled = p.enabled;
                obj.netConnect = p.type === 'netConnect';
                obj.mock = p.type === 'mock';
                obj.rs485Port = p.rs485Port;
                obj.netPort = p.netPort;
                obj.netHost = p.netHost;
                obj.portId = p.portId;
                obj.portSettings = p.portSettings;
                obj.netSettings = p.netSettings;
                obj.type = p.type;
                obj.inactivityRetry = p.inactivityRetry;
                if (p.portId === 0 && p.type === 'screenlogic') {
                    obj.screenlogic = {
                        systemName: p.screenlogic.systemName,
                        connectionType: p.screenlogic.connectionType,
                        password: p.screenlogic.password,
                    }
                }
                var bValid = true;
                if (p.enabled) {
                    if (obj.rs485Port.trim() === '') {
                        $('<div></div>').appendTo(el.find('div[data-bind$=rs485Port]:first')).fieldTip({ message: 'You must supply the port name' });
                        bValid = false;
                    }
                    if (obj.netConnect) {
                        if (obj.netHost.trim() === '') {
                            $('<div></div>').appendTo(el.find('div[data-bind$=netHost]:first')).fieldTip({ message: 'The network host is required' });
                            bValid = false;
                        }
                        if (isNaN(obj.netPort) || obj.netPort < 1 || obj.netPort > 65535) {
                            $('<div></div>').appendTo(el.find('div[data-bind$=netPort]:first')).fieldTip({ message: 'The network port is required between 1 and 65,535' });
                            bValid = false;
                        }
                    }
                    if (obj.screenlogic) {
                        let regexMatch = /Pentair: (?:(?:\d|[A-Z])(?:\d|[A-Z])-){2}(?:\d|[A-Z])(?:\d|[A-Z])/gm
                        // /Pentair: (?:(?:\d|[A-Z])(?:\d|[A-Z])-){2}(?:\d|[A-Z])(?:\d|[A-Z])/g
                        if (obj.screenlogic.systemName.match(regexMatch) === null) {
                            $('<div></div>').appendTo(el.find('div[data-bind$=systemName]:first')).fieldTip({ message: 'Format must be `Pentair: xx-xx-xx`' });
                            bValid = false;
                        }
                    }
                }
                if (bValid) {
                    $.putApiService('/app/rs485Port', obj, 'Setting RS485 Port or ScreenLogic...', function (retPort, status, xhr) {
                        self.dataBind(retPort);
                    });
                }

            });
            $('<div></div>').appendTo(btnPnl).actionButton({ text: 'Delete Port', icon: '<i class="fas fa-trash"></i>' }).addClass('btnDeleteRS485Port')
                .on('click', function (evt) {
                    $.pic.fieldTip.clearTips(divSettings);
                    var p = dataBinder.fromElement(divSettings);
                    console.log(p);
                    var obj = {};
                    obj.type = p.type;
                    obj.enabled = p.enabled;
                    obj.netConnect = p.type === 'netConnect';
                    obj.mock = p.type === 'mock';
                    obj.rs485Port = p.rs485Port;
                    obj.netPort = p.netPort;
                    obj.netHost = p.netHost;
                    obj.portId = p.portId;
                    obj.portSettings = p.portSettings;
                    obj.inactivityRetry = p.inactivityRetry;
                    $.pic.modalDialog.createConfirm('dlgConfirmDeleteRS485Port', {
                        message: `Are you sure you want to delete port ${obj.netConnect ? obj.netHost + ':' + obj.netPort : obj.rs485Port}?`,
                        width: '350px',
                        height: 'auto',
                        title: 'Confirm Delete RS485 Port',
                        buttons: [{
                            text: 'Yes', icon: '<i class="fas fa-trash"></i>',
                            click: function () {
                                $.pic.modalDialog.closeDialog(this);
                                if (obj.portId < 0) divSettings.parents('div.picConfigCategory.cfgRS485Port:first').remove();
                                else {
                                    $.deleteApiService('/app/rs485Port', obj, 'Deleting RS485 Port...', function (retPort, status, xhr) {
                                        divSettings.parents('div.picConfigCategory.cfgRS485Port:first').remove();
                                    });
                                }
                            }
                        },
                        {
                            text: 'No', icon: '<i class="far fa-window-close"></i>',
                            click: function () { $.pic.modalDialog.closeDialog(this); }
                        }]
                    });
                });
            var db = $('div.picDashboard').each(function () {
                this.receivePortStats(true);
            });
        },
        dataBind: function (obj) {
            var self = this, o = self.options, el = self.element;
            el.attr('data-portid', obj.portId);
            el.find('div.pnl-rs485Stats').each(function () {
                $(this).attr('data-portid', obj.portId);
            });
            let port = $.extend(true, {
                "enabled": false,
                "type": obj.type, // obj.type === 'screenlogic' ? 'screenlogic' : obj.netConnect ? 'network' : obj.mockPort ? 'mock' : 'local',
                "rs485Port": "/dev/ttyUSB0",
                "mock": false,
                "netConnect": false,
                "netHost": "raspberrypi",
                "netPort": 9801,
                "inactivityRetry": 10,
                "portSettings": {
                    "baudRate": 9600,
                    "dataBits": 8,
                    "parity": "none",
                    "stopBits": 1,
                    "flowControl": false,
                    "autoOpen": false,
                    "lock": false
                },
                "netSettings": {
                    "keepAlive": false,
                    "allowHalfOpen": false,
                    "keepAliveInitialDelay": 5
                },
                "screenlogic": {
                    "enabled": false,
                    "connectionType": "local",
                    "systemName": "Pentair: 00-00-00",
                    "password": "1234"
                },
            }, obj);
            var acc = el.find('div.picAccordian:first');
            var cols = acc[0].columns();
            if (obj.netConnect === true) {
                cols[0].elGlyph().attr('class', 'fas fa-ethernet')
            }
            else if (obj.mock === true) {
                cols[0].elGlyph().attr('class', 'fas fa-fingerprint')
            }
            else
                cols[0].elGlyph().attr('class', 'fas fa-route');
            console.log(obj);
            cols[0].elText().text(port.portId !== 0 ? 'Aux Port' : 'Primary Port');
            cols[1].elText().text(obj.type === 'screenlogic' ? `ScreenLogic ${obj.screenlogic.systemName}` : port.netConnect ? `${port.netHost}:${port.netPort}` : port.mock ? `Mock Port` : port.rs485Port);
            if (port.portId === 0) {
                el.find('div.btnDeleteRS485Port').hide();
                let sl = el.find('div.pnl-screenlogic')
                el.find('div.cfgScreenlogic').empty();
                $('<div></div>').appendTo(sl).configScreenlogic(obj.screenlogic);
            }

            else el.find('div.btnDeleteRS485Port').show();
            dataBinder.bind(el, port);
            if (typeof port.stats !== 'undefined') el.find('div.pnl-rs485Stats').each(function () {
                this.dataBind(port.stats);
            });
        }
    });
    $.widget('pic.configScreenlogic', {
        options: {},
        _create: function () {
            var self = this, o = self.options, el = self.element;
            self._buildControls();
            el[0].dataBind = function (obj) { return self.dataBind(obj); };
            el[0].setScreenlogicStats = function (stat) { return self.setScreenlogicStats(stat); };
        },
        setScreenlogicStats: function (stat) {
            var self = this, o = self.options, el = self.element;
            el.find('div.cfgScreenlogic').each(function () {
                dataBinder.bind($(this), stat);
            });
        },
        _buildControls: function () {
            var self = this, o = self.options, el = self.element;
            el.addClass('picConfigCategory');
            el.addClass('cfgScreenlogic');
            var pnl = $('<div></div>').appendTo(el);
            // $.getApiService('/config/options/screenlogic', null, function (o, status, xhr) {
            console.log(o);
            var slDivSettings = $('<div></div>').appendTo(pnl).addClass('pnl-screenlogic').css({ display: 'inline-block', verticalAlign: 'top' });
            var line = $('<div></div>').css({ display: 'flex', flexFlow: 'column' }).appendTo(slDivSettings);
            var binding = 'screenlogic.';

            // $('<div></div>').appendTo(line).checkbox({ labelText: 'Enabled', binding: binding + 'enabled', value: opts.cfg.enabled });
            $('<div></div>').appendTo(line).pickList({
                required: true,
                value: o.connectionType,
                bindColumn: 0, displayColumn: 1, labelText: 'Connection Type', binding: binding + 'connectionType',
                columns: [{ binding: 'val', hidden: true, text: 'Id', style: { whiteSpace: 'nowrap' } }, { binding: 'name', hidden: false, text: 'Type', style: { whiteSpace: 'nowrap' } }, { binding: 'desc', text: 'Type', style: { whiteSpace: 'nowrap' } }],
                items: [{ val: 'local', name: 'Local', desc: 'Local ScreenLogic' }, { val: 'remote', name: 'Remote', desc: 'Remote ScreenLogic' }], inputAttrs: { style: { width: '10rem' } }, labelAttrs: { style: { marginLeft: '1rem', width: '8.3rem' } }
            });
            $('<div></div>').appendTo(line).inputField({ value: o.systemName, labelText: 'System Name', binding: binding + 'systemName', inputAttrs: { maxlength: 17, style: { width: '10rem' } }, labelAttrs: { style: { marginLeft: '1rem', width: '8.3rem' } } });
            $('<div></div>').appendTo(line).valueSpinner({ value: o.password, canEdit: true, labelText: 'Password', fmtMask: "###0", emptyMask: "----", binding: binding + 'password', min: 1, max: 9999, step: 1, inputAttrs: { maxlength: 4, style: { width: '8.5rem' } }, labelAttrs: { style: { marginLeft: '1rem', width: '8.3rem' } } });

            $('<div></div>').appendTo(slDivSettings).css({ fontSize: '.8rem' }).configScreenlogicStats();


            /* var btnPnl = $('<div class="picBtnPanel btn-panel"></div>').appendTo(pnl);
            var btnSave = $('<div></div>').appendTo(btnPnl).actionButton({ text: 'Save ScreenLogic', icon: '<i class="fas fa-save" ></i>' });
            btnSave.on('click', function (evt) {
                $.pic.fieldTip.clearTips(slDivSettings);
                var obj = dataBinder.fromElement(slDivSettings);
                console.log(obj);

                var bValid = true;
                if (obj.enabled) {
                    let regexMatch = /Pentair: (?:(?:\d|[A-Z])(?:\d|[A-Z])-){2}(?:\d|[A-Z])(?:\d|[A-Z])/gm
                    // /Pentair: (?:(?:\d|[A-Z])(?:\d|[A-Z])-){2}(?:\d|[A-Z])(?:\d|[A-Z])/g
                    if (obj.systemName.match(regexMatch) === null) {
                        $('<div></div>').appendTo(el.find('div[data-bind$=systemName]:first')).fieldTip({ message: 'Format must be `Pentair: xx-xx-xx`' });
                        bValid = false;
                    }
                }
                if (bValid) {
                    $.putApiService('/app/screenlogic', obj, 'Setting ScreenLogic...', function (retSL, status, xhr) {
                        self.dataBind(retSL);
                    });
                }

            }); */
            $('<div></div>').appendTo(pnl).actionButton({ text: 'Find Units', icon: '<i class="fas fa-binoculars"></i>' })
                .on('click', function (e) {
                    var dlg = $.pic.modalDialog.createDialog('dlgFindPoolController', {
                        message: 'Searching for ScreenLogic Units',
                        width: '400px',
                        height: 'auto',
                        title: 'ScreenLogic',
                        buttons: [{
                            text: 'Cancel', icon: '<i class="far fa-window-close"></i>',
                            click: function () { $.pic.modalDialog.closeDialog(this); }
                        }]
                    });
                    var line = $('<div></div>').appendTo(dlg);
                    var searchStatus = $('<div></div>').appendTo(line).css({ padding: '.5rem' }).addClass('status-text').addClass('picSearchStatus').text('Searching for ScreenLogic units.');
                    line = $('<div></div>').appendTo(dlg);
                    $('<hr></hr>').appendTo(line);
                    line = $('<div></div>').css({ textAlign: 'center' }).appendTo(dlg);
                    dlg.css({ overflow: 'visible' });

                    $.getApiService('/config/options/screenlogic/search', null, 'Searching for Units...', function (units, status, xhr) {
                        if (units.length > 0) {
                            searchStatus.text(units.length + ' ScreenLogic unit(s) found.');

                            for (var i = 0; i < units.length; i++) {
                                var unit = units[i];
                                var divSelection = $('<div></div>').addClass('picButton')
                                    // .addClass('REM')
                                    // .addClass('server')
                                    .addClass('btn').css({ maxWidth: '227px', height: '97px', verticalAlign: 'middle', minWidth: '210px' }).appendTo(line);
                                $('<div></div>').addClass('body-text').css({ textAlign: 'center' }).appendTo(divSelection).append('<i class="fa-solid fa-pager" style="font-size:30pt;color:green;vertical-align:middle;"></i>').append('<span style="vertical-align:middle;"> ScreenLogic</span>');




                                $('<div></div>').css({ textAlign: 'center', marginLeft: '1rem', marginRight: '1rem' }).appendTo(divSelection).text(unit.gatewayName);
                                $('<div></div>').css({ textAlign: 'center', marginLeft: '1rem', marginRight: '1rem' }).appendTo(divSelection).text(`${unit.address}:${unit.port}`);
                                divSelection.data('unit', unit);
                                divSelection.on('click', function (e) {
                                    var unit = $(e.currentTarget).data('unit');
                                    dataBinder.bind(pnl, { screenlogic: { systemName: unit.gatewayName, type: 'local' } });
                                    $.pic.modalDialog.closeDialog(dlg[0]);
                                });
                            }
                        }
                        else {
                            searchStatus.text('No local ScreenLogic units found.');
                        }
                    });
                });
            // });
        },
        dataBind: function (obj) {
            var self = this, o = self.options, el = self.element;
            el.attr('data-portid', obj.portId);
            el.find('div.pnl-screenlogicStats').each(function () {
                $(this);
            });
            let port = $.extend(true,
                {
                    "cfg": {
                        "enabled": false,
                        "type": "local",
                        "systemName": "Pentair: 00-00-00",
                        "password": 0000
                    },
                    "localUnit": {

                    },
                }, obj);
            dataBinder.bind(el, port);
            if (typeof port.stats !== 'undefined') el.find('div.pnl-screenlogicStats').each(function () {
                this.dataBind(port.stats);
            });
        }
    });
    $.widget('pic.configScreenlogicStats', {
        options: {}, 
        _create: function () {
            var self = this, o = self.options, el = self.element;
            self._buildControls();
            el[0].dataBind = function (obj) { return self.dataBind(obj); };
            el[0].setScreenlogicStats = function (stat) { return self.setScreenlogicStats(stat); };
        },
        _buildControls: function () {
            var self = this, o = self.options, el = self.element;
            el.addClass('pnl-screenlogicStats');
            let binding = 'screenlogic.';
            var grpSl
                = $('<fieldset></fieldset>').appendTo(el).css({ fontSize: '.8rem' });
            $('<legend></legend>').appendTo(grpSl).text('Screenlogic Stats');
            line = $('<div></div>').appendTo(grpSl);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Status', binding: binding + 'status', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '8.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpSl);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Socket Ready State', binding: binding + 'readyState', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '8.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpSl);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Socket Connecting', binding: binding + 'connecting', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '8.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpSl);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Socket Destroyed', binding: binding + 'destroyed', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '8.5rem' } } }).css({ lineHeight: 1 });

            // Create the statistics panel.
            line = $('<div></div>').appendTo(grpSl);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Received', units: 'bytes', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: binding + 'bytesReceived', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '8.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpSl);

            $('<div></div>').appendTo(line).staticField({ labelText: 'Sent', units: 'bytes', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: binding + 'bytesSent', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '8.5rem' } } }).css({ lineHeight: 1 });

            var db = $('div.picDashboard').each(function () {
                this.receiveScreenlogicStats(true);
            });
        },
        dataBind: function (obj) {
            var self = this, o = self.options, el = self.element;
            obj.connecting = obj.connecting ? 'true' : 'false';
            obj.destroyed = obj.destroyed ? 'true' : 'false';
            dataBinder.bind(el, obj);
        }
    });
    $.widget('pic.configRS485PortStats', {
        options: {},
        _create: function () {
            var self = this, o = self.options, el = self.element;
            self._buildControls();
            el[0].dataBind = function (obj) { return self.dataBind(obj); };
            el[0].setRS485Stats = function (stat) { return self.setRS485Stats(stat); };
        },
        _buildControls: function () {
            var self = this, o = self.options, el = self.element;
            el.addClass('pnl-rs485Stats');
            var grpPort = $('<fieldset></fieldset>').appendTo(el).css({ fontSize: '.8rem' });
            $('<legend></legend>').appendTo(grpPort).text('Port Stats');
            line = $('<div></div>').appendTo(grpPort);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Status', binding: 'status', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpPort);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Reconnects', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: 'reconnects', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });


            // Create the statistics panel.
            var grpRec = $('<fieldset></fieldset>').appendTo(el).css({ fontSize: '.8rem' });
            $('<legend></legend>').appendTo(grpRec).text('Receive Stats');
            line = $('<div></div>').appendTo(grpRec);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Received', units: 'bytes', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: 'bytesReceived', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpRec);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Successful', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: 'recSuccess', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpRec);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Failed', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: 'recFailed', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpRec);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Rewinds', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: 'recRewinds', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpRec);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Collisions', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: 'recCollisions', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpRec);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Failure Rate', dataType: 'number', fmtMask: '#,##0.##', units: '%', binding: 'recFailureRate', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            var grpSend = $('<fieldset></fieldset>').appendTo(el).css({ fontSize: '.8rem' });
            $('<legend></legend>').appendTo(grpSend).text('Send Stats');
            line = $('<div></div>').appendTo(grpSend);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Sent', units: 'bytes', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: 'bytesSent', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpSend);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Successful', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: 'sndSuccess', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpSend);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Aborted', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: 'sndAborted', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpSend);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Retries', dataType: 'number', fmtMask: '#,##0', emptyMask: '0', binding: 'sndRetries', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            line = $('<div></div>').appendTo(grpSend);
            $('<div></div>').appendTo(line).staticField({ labelText: 'Failure Rate', dataType: 'number', fmtMask: '#,##0.##', units: '%', binding: 'sndFailureRate', inputAttrs: { style: { width: '5.7rem', textAlign: 'right', display: 'inline-block' } }, labelAttrs: { style: { width: '5.5rem' } } }).css({ lineHeight: 1 });
            var db = $('div.picDashboard').each(function () {
                this.receiveScreenlogicStats(true);
            });
        },
        dataBind: function (obj) {
            var self = this, o = self.options, el = self.element;
            el.attr('data-portid', obj.portId);
            dataBinder.bind(el, obj);
        }
    });
    $.widget('pic.configMockControllerType', {
        options: {},
        _create: function () {
            var self = this, o = self.options, el = self.element;
            self._buildControls();
            el[0].dataBind = function (obj) { return self.dataBind(obj); };
        },
        _buildControls: function () {
            var self = this, o = self.options, el = self.element;
            el.addClass('picConfigCategory');
            el.addClass('cfgControllerType');

            // Alright so now we need to allow the user to select a controller type but only if we are a 
            $.getApiService('/config/options/anslq25ControllerType', null, function (opts, status, xhr) {
                console.log(opts);
                // var type = opts.isActive ? opts.controllerTypes[0] : opts.controllerTypes.find(elem => elem.type === opts.controllerType);
                // var model = opts.isActive === false ? type.models.find(elem => elem.val === opts.model) : type.models[0];

                var line = $('<div></div>').appendTo(el);
                $('<div></div>').appendTo(el).addClass('anslq25-ct-narrative-warning').html(`EXTREMELY EXPERIMENTAL`);
                $('<div></div>').appendTo(el).addClass('anslq25-ct-narrative').html(`This will enable an AN-SLQ25 MOCK controller on your system. \nIf you have a NIXIE system it convert your Nixie controller to the selected mock controller because it will see the packets and believe it is talking to a real controller.  If you have an OCP (Outdoor Control Panel = Pentair or Aqualink etc) your hardware may get very confused.\nThis should ONLY be used for testing purposes.`);
                $('<hr></hr>').appendTo(el);
                line = $('<div class="anslq25Details"></div>').appendTo(el);
                self._resetAnslq25Panel(opts);
            });
        },
        _setModelAttributes: function (model) {
            var self = this, o = self.options, el = self.element;
            var narr = el.find('div.ct-narrative');
            narr.empty();
            var bdy = model.shared || model.dual ? 'dual' : model.bodies === 0 ? 'zero' : 'single';
            $('<div></div>').appendTo(narr).html(`The ${model.desc} controller is a ${bdy} body controller.`);
            $('<hr></hr>').appendTo(narr);
            switch (bdy) {
                case 'zero':
                    $('<div></div>').appendTo(narr).html(`Zero body controllers provide no control over body features or filters.  As a result, features such as heaters, water temperature, and chemistry controllers are not defined for this type of controller.`);
                    break;
                case 'single':
                    $('<div></div>').appendTo(narr).html(`Single body controllers are capable of controlling only a single body of water.  For instance a stand-alone pool or spa.`);
                    break;
                case 'dual':
                    if (model.shared) {
                        $('<div></div>').appendTo(narr).html(`This controller is capable of controlling two bodies of water in a shared mode.  This gives you the capability of controlling a pool/spa, pool/pool, or spa/spa combination where there is shared equipment.  An intake and return valve is used to redirect the water through a single filter to the appropriate body depending on which mode is selected.`);
                    }
                    else {
                        $('<div></div>').appendTo(narr).html(`This controller is capable of controlling two bodies of water separately.  The bodies are separate and use their own filtration system and pumps.`);
                    }
                    break;
            }
        },
        _resetAnslq25Panel: function (opts) {
            var self = this, o = self.options, el = self.element;
            var type = opts.isActive ? opts.controllerTypes.find(elem => elem.type === opts.controllerType) : opts.controllerTypes[0];
            var model = opts.isActive ? type.models.find(elem => elem.val === opts.model) : type.models[0];

            let binding = 'anslq25';
            var pnl = el.find('div.anslq25Details');
            pnl.empty();
            var line = $('<div></div>').appendTo(pnl);
            console.log(type);
            // $('<input type="hidden" data-bind="controllerType"></input>').appendTo(line).val(opts.controllerType);
            $('<div></div>').staticField({ labelText: `Current Panel Type`, value: typeof opts.controllerType === 'undefined' || opts.controllerType === 'none' || opts.isActive === false ? 'None' : model.desc }).appendTo(line);
            line = $('<div></div>').appendTo(pnl);
            $('<div></div>').appendTo(line).pickList({
                required: true,
                value: opts.portId || 0,
                bindColumn: 0, displayColumn: 1, labelText: 'Port', binding: binding + 'portId',
                columns: [{ binding: 'portId', hidden: true, text: 'portId', style: { whiteSpace: 'nowrap' } }, { binding: 'name', text: 'Port', style: { whiteSpace: 'nowrap' } }, { binding: 'rs485Port', text: 'Path', style: { whiteSpace: 'nowrap' } }],
                items: opts.rs485ports, inputAttrs: { style: { width: '5rem' } }, labelAttrs: { style: { width: '2.25rem', marginLeft: '.25rem' } }
            });
            $('<div></div>').appendTo(line).checkbox({ labelText: 'Broadcast comms to other ports.', binding: 'broadcastComms' }).attr('title', 'Check if you want to communication packets sent internally to other ports and want packets from other ports cloned to this ANSLQ25 server.  This is useful with mock ports and not needed if you have two physical ports and have them connected.  Communications will only be cloned to other ports that do not have a pump or chlorinator assigned to them.');
            //$('<div></div>').staticField({ labelText: `Current Model`, value: opts.model || 'None' }).appendTo(line);
            line = $('<div></div>').appendTo(pnl);
            $('<div></div>').pickList({
                required: true, value: type.type,
                bindColumn: 0, displayColumn: 1, labelText: 'Controller Type', binding: binding + 'ControllerType',
                columns: [{ binding: 'type', text: 'Type', hidden: true, style: { whiteSpace: 'nowrap' } }, { binding: 'name', hidden: false, text: 'Model', style: { whiteSpace: 'nowrap' } }],
                items: opts.controllerTypes, inputAttrs: { style: { width: '9.7rem' } }, labelAttrs: { style: { marginLeft: '1rem' } }
            }).appendTo(line).on('selchanged', function (evt) {
                type = evt.newItem;
                self._resetAnslq25Panel(opts);
            })[0];
            $('<div></div>').pickList({
                required: true, value: model.val,
                bindColumn: 0, displayColumn: 2, labelText: 'Model', binding: binding + 'model',
                columns: [{ binding: 'val', hidden: true, text: 'Id', style: { whiteSpace: 'nowrap' } }, { binding: 'name', hidden: false, text: 'Model', style: { whiteSpace: 'nowrap' } }, { binding: 'desc', text: 'Description', style: { whiteSpace: 'nowrap' } }],
                items: type.models, inputAttrs: { style: { width: '9.7rem' } }, labelAttrs: { style: { marginLeft: '1rem' } }
            }).appendTo(line).on('selchanged', function (evt) {
                self._setModelAttributes(evt.newItem);

            })[0];

            if (typeof type.expansionModules !== 'undefined' && type.expansionModules.length > 0 && type.type === 'intellitouch') {
                for (let i = 0; i < type.expansionModules.length; i++) {
                    line = $('<div></div>').appendTo(line);
                    $('<div></div>').pickList({
                        required: true,
                        value: type.expansionModules[i].type,
                        bindColumn: 0, displayColumn: 2, labelText: `Expansion Module ${i + 1}`, binding: `expansion${i + 1}`,
                        columns: [{ binding: 'val', hidden: true, text: 'Id', style: { whiteSpace: 'nowrap', marginTop: '1rem' } }, { binding: 'name', hidden: false, text: 'Expansion', style: { whiteSpace: 'nowrap' } }, { binding: 'desc', text: 'Description', style: { whiteSpace: 'nowrap' } }],
                        items: type.expansionModules, inputAttrs: { style: { width: '9.7rem' } }, labelAttrs: { style: { marginLeft: '1rem' } }
                    }).appendTo(line);
                }
            }
            $('<div></div>').appendTo(line).addClass('ct-narrative');
            self._setModelAttributes(model);
            btnPnl = $('<div class="picBtnPanel btn-panel"></div>').appendTo(pnl);

            var btnDelete = $('<div></div>').appendTo(btnPnl).actionButton({ text: 'Delete Anslq-25', icon: '<i class="fas fa-trash"></i>' })
            if (makeBool(typeof opts.controllerType === 'undefined' || opts.controllerType === 'none' || opts.isActive === false || opts.isActive === false)) btnDelete.addClass('disabled');
            btnDelete.on('click', function (e) {
                var p = $(e.target).parents('div.picAccordian-contents:first');
                var v = dataBinder.fromElement(p);
                $.pic.modalDialog.createConfirm('dlgConfirmDeleteAnslq25', {
                    message: 'Are you sure you want to delete Anslq25 ' + v.name + '?',
                    width: '350px',
                    height: 'auto',
                    title: 'Confirm Delete Anslq25 Mock Controller',
                    buttons: [{
                        text: 'Yes', icon: '<i class="fas fa-trash"></i>',
                        click: function () {
                            $.pic.modalDialog.closeDialog(this);
                            // if (v.id <= 0) p.parents('div.picConfigCategory.cfgPump:first').remove();
                            // else {
                            console.log('Deleting Anslq25');
                            $.deleteApiService('/app/anslq25', v, 'Deleting Anslq25 Mock Controller...', function (data, status, xhr) {
                                //p.parents('div.picConfigCategory.cfgPump:first').remove();
                                opts.controllerType = data.controllerType;
                                opts.model = data.model;
                                opts.isActive = data.isActive;
                                self._resetAnslq25Panel(opts);
                            });
                            // }
                        }
                    },
                    {
                        text: 'No', icon: '<i class="far fa-window-close"></i>',
                        click: function () { $.pic.modalDialog.closeDialog(this); }
                    }]
                });
            });

            var btnSave = $('<div></div>').appendTo(btnPnl).actionButton({ text: 'Save Anslq-25', icon: '<i class="fas fa-save"></i>' });
            btnSave.on('click', function (e) {
                var v = dataBinder.fromElement(pnl);
                console.log(v);

                $.pic.modalDialog.createConfirm('dlgConfirmAddAnslq25', {
                    message: 'Are you sure you have read the fine print and know what you are doing?  You may overwrite your entire pool configuration.  njsPC will now sense an ' + v.anslq25ControllerType + ' on the bus and change to this controller type.',
                    width: '350px',
                    height: 'auto',
                    title: 'Confirm Anslq-25 Mock Controller',
                    buttons: [{
                        text: 'Yes', icon: '<i class="fas fa-check"></i>',
                        click: function () {
                            $.pic.modalDialog.closeDialog(this);
                            // if (v.id <= 0) p.parents('div.picConfigCategory.cfgPump:first').remove();

                            console.log('Adding Anslq-25');
                            if (dataBinder.checkRequired(pnl)) {
                                $.putApiService('/config/anslq25ControllerType', v, 'Adding Anslq-25 Mock Controller...', function (data, status, xhr) {
                                    opts.controllerType = data.controllerType;
                                    opts.model = data.model;
                                    opts.isActive = data.isActive;
                                    self._resetAnslq25Panel(opts);
                                });
                            }

                        }
                    },
                    {
                        text: 'No', icon: '<i class="far fa-window-close"></i>',
                        click: function () { $.pic.modalDialog.closeDialog(this); }
                    }]
                });



            });


        },
        dataBind: function (obj) {
            var self = this, o = self.options, el = self.element;
            var type = o.controllerType !== '' ? o.controllerTypes.find(elem => elem.type === obj.controllerType) : o.controllerTypes[0];
            var model = o.model !== '' ? type.models.find(elem => elem.val === obj.equipment.modules[0].type) : type.models[0];

            dataBinder.bind(el, obj);
        }
    });
})(jQuery);

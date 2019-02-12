import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Slide from 'react-reveal/Slide';
import { DojotBtnClassic } from 'Components/DojotButton';
import ImageActions from 'Actions/ImageActions';
import TemplateActions from 'Actions/TemplateActions';
import MaterialInput from 'Components/MaterialInput';
import { InputCheckbox } from 'Components/DojotIn';
import toaster from 'Comms/util/materialize';
import { templateType } from '../../../TemplatePropTypes';
import SidebarFirmImages from './SidebarFirmImages';
import SidebarButton from '../SidebarButton';

function createAttribute(label, type, value_type, static_value) {
    return {
        id: `${Math.floor(Math.random() * 100000)}`,
        label,
        type,
        value_type,
        static_value,
    };
}

function createImageAttribute(data, type) {
    const aux = createAttribute(data.user_value, type, 'string', '');
    aux.metadata = [createAttribute(data.dojot_value, 'static', 'bool', true)];
    return aux;
}

//
class SidebarFirmConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            enabled: false,
            showFirmwareImage: false,
            attrs: {},
        };

        this.dictFirmwareUpdate = {
            'dojot:firmware_update:state': 'current_state',
            'dojot:firmware_update:update_result': 'update_result',
            'dojot:firmware_update:version': 'current_version',
            'dojot:firmware_update:desired_version': 'upload_image',
            'dojot:firmware_update:update': 'apply_image'
 };


        this.changeAttrValue = this.changeAttrValue.bind(this);
        this.changeFirmwareState = this.changeFirmwareState.bind(this);
        this.defaultAttributes = this.defaultAttributes.bind(this);
        this.saveImageConfig = this.saveImageConfig.bind(this);
        this.toogleSidebarFirmImage = this.toogleSidebarFirmImage.bind(this);
        this.updateFieldsWithTemplateData = this.updateFieldsWithTemplateData.bind(this);
    }

    componentDidMount() {
        this.defaultAttributes();
        const { isNewTemplate, template } = this.props;
        if (!isNewTemplate) {
            if (template.img_attrs.length === 0)
            {
                ImageActions.updateImageAllowed(false);
            }
            else
            {
                ImageActions.updateImageAllowed(true);
                this.updateFieldsWithTemplateData(template.img_attrs);
            }
            ImageActions.fetchImages.defer(template.id);
        }
    }

    updateFieldsWithTemplateData(defaultAttrs) {
        console.log('updateFieldsWithTemplateData', defaultAttrs);
        let { attrs } = this.state; 
        defaultAttrs.forEach((element) => {
            attrs[this.dictFirmwareUpdate[element.metadata[0].label]].user_value = element.label;
        });

        console.log("attrs",attrs);
        this.setState({attrs});
    }

    toogleSidebarFirmImage() {
        console.log('toogleSidebarFirmImage');
        const { showFirmwareImage } = this.state;
        this.setState({
            showFirmwareImage: !showFirmwareImage,
        });
    }

    defaultAttributes() {
        const attrs = {};

        // just some default values to user
        attrs.current_state = { label: 'Current State', dojot_value: 'dojot:firmware_update:state', user_value: 'image_state' };

        attrs.update_result = { label: 'Update Result', dojot_value: 'dojot:firmware_update:update_result', user_value: 'update_result' };

        attrs.current_version = { label: 'Current Version', dojot_value: 'dojot:firmware_update:version', user_value: 'current_version' };

        attrs.upload_image = { label: 'Transfer Image', dojot_value: 'dojot:firmware_update:desired_version', user_value: 'transferred_version' };

        attrs.apply_image = { label: 'Apply Image', dojot_value: 'dojot:firmware_update:update', user_value: 'apply_image' };


        this.setState({
            attrs,
        });
    }

    changeFirmwareState(e) {
        console.log('changeFirmwareState');
        const { imageAllowed } = this.props;
        ImageActions.updateImageAllowed(!imageAllowed);
    }

    saveImageConfig(e) {
        e.preventDefault();

        const { template } = this.props;
        const { attrs } = this.state;
        template.attrs.push(createImageAttribute(attrs.current_state, 'dynamic'));
        template.attrs.push(createImageAttribute(attrs.update_result, 'dynamic'));
        template.attrs.push(createImageAttribute(attrs.current_version, 'dynamic'));
        template.attrs.push(createImageAttribute(attrs.upload_image, 'actuator'));
        template.attrs.push(createImageAttribute(attrs.apply_image, 'actuator'));

        console.log('Final template', template);
        TemplateActions.triggerUpdate(template, () => {
            toaster.success('Template updated');
        });
    }

    changeAttrValue(event, attr) {
        event.preventDefault();
        const name = event.target.name;
        const value = event.target.value;
        const { attrs } = this.state;
        attrs[name].user_value = value;
        this.setState({
            attrs,
        });
    }

    render() {
        console.log('SidebarFirmConfig. render', this.props);
        const {
            imageAllowed, images, showFirmware, template, isNewTemplate, toogleSidebarFirmware,
        } = this.props;
        const { attrs, showFirmwareImage } = this.state;
        return (
            <Fragment>
                <Slide right when={showFirmware} duration={300}>
                    { showFirmware
                        ? (
                            <div className="-sidebar sidebar-attribute sidebar-firmware">
                                <div className="header">
                                    <div className="title">Firmware</div>
                                    <div className="icon">
                                        <img src="images/firmware-red.png" alt="device-icon" />
                                    </div>
                                    <div className="header-path">
                                        {'template > firmware management'}
                                    </div>
                                </div>

                                <div className="body box-firmware-enabled">
                                    <div className="firmware-enabled">
                                        <div className="icon">
                                            <img src="images/firmware-red.png" alt="device-icon" />
                                        </div>
                                        <div className="description">
                                            {imageAllowed
                                                ? <b>Firmware enabled</b>
                                                : <b>Firmware disabled</b>
                                            }
                                            <br />
                                            This option allows add images in template.
                                        </div>
                                        <div className="symbol">
                                            <InputCheckbox
                                                name="Firmware Enabled"
                                                checked={imageAllowed}
                                                handleChangeCheckbox={this.changeFirmwareState}
                                            />
                                        </div>
                                    </div>
                                    <div className="line-2" />
                                    { imageAllowed
                                        ? (
<div className="body-form image-related-attrs">
                                        <span>To confirm the firmware configuration, please update the following attributes:</span>

                                        <div className="body-attribute-name">
                                            <MaterialInput
                                                name="current_state"
                                                className="attribute-type"
                                                maxLength={40}
                                                value={attrs.current_state.user_value}
                                                onChange={e => this.changeAttrValue(e, attrs)}
                                            >
                                                Current State
                                            </MaterialInput>
                                        </div>
                                        <div className="body-attribute-name">
                                            <MaterialInput
                                                name="update_result"
                                                className="attribute-type"
                                                maxLength={40}
                                                value={attrs.update_result.user_value}
                                                onChange={e => this.changeAttrValue(e, attrs)}
                                            >
                                                Update Result
                                            </MaterialInput>
                                        </div>
                                        <div className="body-attribute-name">
                                            <MaterialInput
                                                name="upload_image"
                                                className="attribute-type"
                                                maxLength={40}
                                                value={attrs.upload_image.user_value}
                                                onChange={e => this.changeAttrValue(e, attrs)}
                                            >
                                                Upload Image
                                            </MaterialInput>
                                        </div>
                                        <div className="body-attribute-name">
                                            <MaterialInput
                                                name="apply_image"
                                                className="attribute-type"
                                                maxLength={40}
                                                value={attrs.apply_image.user_value}
                                                onChange={e => this.changeAttrValue(e, attrs)}
                                            >
                                                Apply Image
                                            </MaterialInput>
                                        </div>
                                        <div className="body-attribute-name">
                                            <MaterialInput
                                                name="current_version"
                                                className="attribute-type"
                                                maxLength={40}
                                                value={attrs.current_version.user_value}
                                                onChange={e => this.changeAttrValue(e, attrs)}
                                            >
                                                Current Version
                                            </MaterialInput>
                                        </div>
                                    </div>
)
                                        : null }
                                    <div className="body-actions">
                                        <div className="body-actions--divider" />
                                        <SidebarButton
                                            onClick={() => this.toogleSidebarFirmImage()}
                                            icon="firmware"
                                            text="Manage Images"
                                        />
                                    </div>
                                </div>
                                <div className="footer">
                                    <Fragment>
                                        <DojotBtnClassic label="discard" type="secondary" onClick={toogleSidebarFirmware} />
                                        <DojotBtnClassic color="red" label="save" type="primary" onClick={e => this.saveImageConfig(e)} />
                                    </Fragment>
                                </div>
                            </div>
                        )
                        : <div />
                    }
                </Slide>
                <SidebarFirmImages
                    showFirmware={showFirmwareImage}
                    isNewTemplate={isNewTemplate}
                    templateId={template.id}
                    images={images}
                    toogleSidebarFirmware={this.toogleSidebarFirmImage}
                />
            </Fragment>
        );
    }
}


SidebarFirmConfig.defaultProps = {
    showFirmware: false,
    isNewTemplate: false,
};

SidebarFirmConfig.propTypes = {
    showFirmware: PropTypes.bool,
    isNewTemplate: PropTypes.bool,
    template: PropTypes.shape(templateType).isRequired,
    toogleSidebarFirmware: PropTypes.func.isRequired,
};

export default SidebarFirmConfig;

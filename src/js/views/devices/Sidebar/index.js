import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import TemplateStore from 'Stores/TemplateStore';
import AltContainer from 'alt-container';
import toaster from 'Comms/util/materialize';
import util from 'Comms/util/util';
import { withNamespaces } from 'react-i18next';
import ImageStore from 'Stores/ImageStore';
import DeviceStore from 'Stores/DeviceStore';
import MeasureStore from 'Stores/MeasureStore';
import SidebarDevice from './SidebarDevice';
import SidebarManageTemplates from './SidebarManageTemplates';
import SidebarDeviceAttrs from './SidebarDeviceAttrs';
import SidebarImage from './SidebarImage/index';
import { FormActions } from '../Actions';


// function handleTemplateWithImages(device) {
//     console.log('Templates', device.templates);
//     // create a code here to check if template is a template allowed to receive images;
//     if (device.templates) {
//         return {
//             templateIdAllowedImage: device.templates[0],
//             hasTemplateWithImages: true,
//         };
//     }
//     return {
//         templateIdAllowedImage: '',
//         hasTemplateWithImages: false,
//     };
// }

class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showSidebarDevice: false,
            showManageTemplates: false,
            showDeviceAttrs: false,
            showSidebarImage: false,
            isNewDevice: false,
            usedTemplates: [],
            device: {},
            selectAttr: [],
            errors: {},
            isShowSidebarDelete: false,
            deviceAttrsTitle: '',
        };

        this.toogleSidebarImages = this.toogleSidebarImages.bind(this);
        this.handleShowManageTemplate = this.handleShowManageTemplate.bind(this);
        this.handleShowDeviceAttrs = this.handleShowDeviceAttrs.bind(this);
        this.handleSelectTemplate = this.handleSelectTemplate.bind(this);
        this.handleChangeName = this.handleChangeName.bind(this);
        this.handleChangeMetadata = this.handleChangeMetadata.bind(this);
        this.handleChangeAttr = this.handleChangeAttr.bind(this);
        this.toogleSidebarDelete = this.toogleSidebarDelete.bind(this);
        this.validAttrs = this.validAttrs.bind(this);
        this.save = this.save.bind(this);
        this.update = this.update.bind(this);
        this.remove = this.remove.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        // const tempWithImages = handleTemplateWithImages(props.device);
        // ...tempWithImages,
        if (props.showSidebarDevice !== state.showSidebarDevice) {
            return {
                ...state,
                device: props.device,
                showSidebarDevice: props.showSidebarDevice,
                isNewDevice: props.isNewDevice,
            };
        }
        if (props.device !== state.device) {
            return {
                ...state,
                device: props.device,
                isNewDevice: props.isNewDevice,
            };
        }
        return null;
    }

    componentDidMount() {
        const { showSidebarDevice, device, isNewDevice } = this.props;
        this.setState({
            showSidebarDevice,
            device,
            isNewDevice,
        });
    }

    toogleSidebarImages() {
        const { showSidebarImage, isNewDevice } = this.state;
        console.log('toogleSidebarImages', isNewDevice);
        if (!isNewDevice) {
            this.setState({
                showSidebarImage: !showSidebarImage,
            });
        }
    }

    handleShowManageTemplate() {
        this.setState(prevState => ({
            showManageTemplates: !prevState.showManageTemplates,
        }));
    }


    handleSelectTemplate(checked, template) {
        const { device } = this.state;
        if (checked) {
            device.templates = device.templates.filter(id => id !== template.id);
            device.attrs = device.attrs.filter(item => +item.template_id !== template.id);
        } else {
            device.templates.push(template.id);
            device.attrs = device.attrs.concat(template.attrs);
        }

        device.configValues = [];
        device.dynamicValues = [];
        device.staticValues = [];
        device.actuatorValues = [];
        device.metadata = {};

        device.configValues = device.configValues.concat(device.attrs.filter(item => item.type === 'meta'));
        device.dynamicValues = device.dynamicValues.concat(device.attrs.filter(item => item.type === 'dynamic'));
        device.staticValues = device.staticValues.concat(device.attrs.filter(item => item.type === 'static'));
        device.actuatorValues = device.actuatorValues.concat(device.attrs.filter(item => item.type === 'actuator'));
        device.attrs.forEach((item) => {
            if (Object.prototype.hasOwnProperty.call(item, 'metadata')) {
                device.metadata[item.id] = [...item.metadata];
            }
        });

        this.setState({
            device,
            usedTemplates: device.templates,
        });
    }

    handleChangeName(value) {
        const { device } = this.state;
        device.label = value;
        this.setState(prevState => ({
            ...prevState,
            device,
        }));
    }

    handleShowDeviceAttrs(attr, title) {
        this.setState(prevState => ({
            showDeviceAttrs: !prevState.showDeviceAttrs,
            selectAttr: attr,
            deviceAttrsTitle: title,
            errors: [],
        }));
    }

    validAttrs(attrs) {
        const newAttrs = {};
        const errors = {};
        attrs.forEach((item) => {
            newAttrs[item.id] = item;
            const isValid = util.isTypeValid(item.static_value, item.value_type, item.type);
            if (!isValid.result) {
                errors[item.id] = {
                    message: isValid.error,
                    metadata: [],
                };
            }
        });

        const hasError = Object.keys(errors).length > 0;
        if (hasError) {
            this.setState({
                errors,
                showDeviceAttrs: true,
            });
        } else {
            const { device } = this.state;
            device.attrs = device.attrs.map((item) => {
                if (newAttrs[item.id] !== undefined) return newAttrs[item.id];
                return item;
            });

            device.configValues = [];
            device.dynamicValues = [];
            device.staticValues = [];
            device.actuatorValues = [];
            device.metadata = {};

            device.configValues = device.configValues.concat(device.attrs.filter(item => item.type === 'meta'));
            device.dynamicValues = device.dynamicValues.concat(device.attrs.filter(item => item.type === 'dynamic'));
            device.staticValues = device.staticValues.concat(device.attrs.filter(item => item.type === 'static'));
            device.actuatorValues = device.actuatorValues.concat(device.attrs.filter(item => item.type === 'actuator'));
            device.attrs.forEach((item) => {
                if (Object.prototype.hasOwnProperty.call(item, 'metadata')) {
                    device.metadata[item.id] = [...item.metadata];
                }
            });

            this.setState({
                showDeviceAttrs: false,
                device,
                errors: [],
            });
        }
    }

    handleChangeAttr(event, id) {
        const { selectAttr } = this.state;
        const { value } = event.target;
        const updateAttr = selectAttr.map((item) => {
            if (item.id === id) {
                return {
                    ...item,
                    static_value: value,
                };
            }
            return item;
        });

        this.setState({
            selectAttr: updateAttr,
            errors: [],
        });
    }

    handleChangeMetadata(event, id) {
        const { device } = this.state;
        device.metadata[id] = device.metadata[id].map(meta => (meta.label === event.target.name
            ? {
                ...meta,
                static_value: event.target.value,
            }
            : meta
        ));

        this.setState({
            device,
        });
    }

    toogleSidebarDelete() {
        this.setState(prevState => ({
            isShowSidebarDelete: !prevState.isShowSidebarDelete,
            showSidebarDevice: !prevState.showSidebarDevice,
        }));
    }

    save() {
        const { device } = this.state;
        const { ops, t } = this.props;
        const saveDevice = this.formatDevice(device);
        const isValid = this.validDevice(saveDevice);

        if (isValid.result) {
            FormActions.addDevice(saveDevice, () => {
                toaster.success(t('devices:alerts.create'));
                ops._fetch();
            });
        } else {
            toaster.error(isValid.error);
        }
    }

    update() {
        const { device } = this.state;
        const { ops, t } = this.props;
        const updateDevice = this.formatDevice(device);
        const isValid = this.validDevice(updateDevice);

        if (isValid.result) {
            FormActions.triggerUpdate(updateDevice, () => {
                toaster.success(t('devices:alerts.update'));
                ops._fetch();
            });
        } else {
            toaster.error(isValid.error);
        }
    }

    remove() {
        const { device } = this.state;
        const { ops, t } = this.props;
        FormActions.triggerRemoval(device, () => {
            toaster.success(t('devices:alerts.remove'));
            this.setState({
                isShowSidebarDelete: false,
                showSidebarDevice: false,
            }, ops._fetch());
        });
    }

    formatDevice(device) {
        const formatDevice = { ...device };
        formatDevice.attrs = formatDevice.attrs.map((attr) => {
            if (formatDevice.metadata[attr.id]) {
                return {
                    ...attr,
                    metadata: formatDevice.metadata[attr.id],
                };
            }
            return attr;
        });
        delete formatDevice.configValues;
        delete formatDevice.dynamicValues;
        delete formatDevice.staticValues;
        delete formatDevice.actuatorValues;
        delete formatDevice.metadata;

        return formatDevice;
    }

    validDevice(device) {
        const { t } = this.props;
        if (device.templates.length < 1) {
            return {
                result: false,
                error: t('devices:select_template'),
            };
        }

        const isValidName = util.isNameValid(device.label);
        if (!isValidName.result) {
            return isValidName;
        }

        return {
            result: true,
            error: '',
        };
    }

    render() {
        const {
            showSidebarDevice,
            showManageTemplates,
            showDeviceAttrs,
            showSidebarImage,
            device,
            selectAttr,
            isNewDevice,
            errors,
            isShowSidebarDelete,
            deviceAttrsTitle,
        } = this.state;
        const {
            templateIdAllowedImage,
            hasTemplateWithImages,
        } = this.props;


        console.log('hasTemplateWithImages', hasTemplateWithImages);
        if (!Object.prototype.hasOwnProperty.call(device, 'attrs')) return <div />;
        const { metadata } = device;
        return (
            <Fragment>
                <SidebarDevice
                    hasTemplateWithImages={hasTemplateWithImages}
                    showSidebarDevice={showSidebarDevice}
                    device={device}
                    isNewDevice={isNewDevice}
                    isShowSidebarDelete={isShowSidebarDelete}
                    handleChangeName={this.handleChangeName}
                    handleShowManageTemplate={this.handleShowManageTemplate}
                    toogleSidebarImages={this.toogleSidebarImages}
                    handleShowDeviceAttrs={this.handleShowDeviceAttrs}
                    toogleSidebarDelete={this.toogleSidebarDelete}
                    save={this.save}
                    update={this.update}
                    remove={this.remove}
                />
                <AltContainer store={TemplateStore}>
                    <SidebarManageTemplates
                        showManageTemplates={showManageTemplates}
                        selectedTemplates={device.templates}
                        handleShowManageTemplate={this.handleShowManageTemplate}
                        handleSelectTemplate={this.handleSelectTemplate}
                    />
                </AltContainer>
                <SidebarDeviceAttrs
                    showDeviceAttrs={showDeviceAttrs}
                    selectAttr={selectAttr}
                    metadata={metadata}
                    deviceAttrsTitle={deviceAttrsTitle}
                    validAttrs={this.validAttrs}
                    handleChangeMetadata={this.handleChangeMetadata}
                    handleChangeAttr={this.handleChangeAttr}
                    handleShowDeviceAttrs={this.handleShowDeviceAttrs}
                    errors={errors}
                />
                <AltContainer store={[ImageStore, DeviceStore, MeasureStore]}>
                    <SidebarImage
                        deviceId={device.id}
                        hasTemplateWithImages={hasTemplateWithImages}
                        templateIdAllowedImage={templateIdAllowedImage}
                        showSidebarImage={showSidebarImage}
                        toogleSidebarImages={this.toogleSidebarImages}
                    />
                </AltContainer>
            </Fragment>
        );
    }
}

Sidebar.defaultProps = {
    showSidebarDevice: true,
    device: {
        label: '',
        id: '',
        protocol: 'MQTT',
        templates: [],
        tags: [],
        attrs: [],
        configValues: [],
        dynamicValues: [],
        staticValues: [],
        actuatorValues: [],
        metadata: {},
    },
    isNewDevice: false,
};

Sidebar.propTypes = {
    showSidebarDevice: PropTypes.bool,
    device: PropTypes.shape({
        label: PropTypes.string,
        id: PropTypes.string,
        protocol: PropTypes.string,
        templates: PropTypes.array,
        tags: PropTypes.array,
        attrs: PropTypes.array,
        configValues: PropTypes.array,
        dynamicValues: PropTypes.array,
        staticValues: PropTypes.array,
        actuatorValues: PropTypes.array,
        metadata: PropTypes.object,
    }),
    isNewDevice: PropTypes.bool,
    ops: PropTypes.shape({
        _fetch: PropTypes.func,
    }).isRequired,
    t: PropTypes.func.isRequired,
};

export default withNamespaces()(Sidebar);

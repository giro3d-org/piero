<script setup lang="ts">
    import { useNotificationStore } from '@/stores/notifications';
    import { isColor, isLink, isVector3 } from '@/utils/Types';

    import ColorFragment from './ColorFragment.vue';
    import CoordinateTuple from './CoordinateTuple.vue';
    import LinkFragment from './LinkFragment.vue';

    const props = defineProps<{
        attrName: string;
        attrValue: unknown;
    }>();

    const notifications = useNotificationStore();

    function copyToClipboard(): void {
        const value = props.attrValue;
        const textValue = getTextValue(value);

        navigator.clipboard.writeText(`${props.attrName}: ${textValue}`).catch(console.warn);
        notifications.push({ level: 'info', title: 'Copied to clipboard' });
    }

    function getTextValue(value: unknown): string {
        if (isLink(value)) {
            return value.href;
        } else if (isColor(value)) {
            return `#${value.getHexString()}`;
        } else if (isVector3(value)) {
            return `${value.x}, ${value.y}, ${value.z}`;
        } else if (typeof value === 'string') {
            return value;
        } else if (typeof value === 'number') {
            return value.toString();
        } else if (typeof value === 'boolean') {
            return value.toString();
        } else if (value === null) {
            return 'null';
        } else if (Array.isArray(value)) {
            return value.map(getTextValue).join(',');
        }

        return '<cannot format value>';
    }
</script>

<template>
    <div class="attribute-row p-2" @click="copyToClipboard" title="Copy to clipboard">
        <div class="text-truncate fw-bold">{{ attrName }}</div>
        <div class="text-truncate">
            <template v-if="props.attrValue === undefined"
                ><span class="text-secondary">undefined</span></template
            >
            <template v-else-if="props.attrValue === null"
                ><span class="text-secondary">null</span></template
            >
            <template v-else-if="typeof props.attrValue === 'object'">
                <template v-if="Array.isArray(props.attrValue)">
                    <table>
                        <AttributeItem
                            v-for="(subitem, index) in props.attrValue"
                            :key="index"
                            :attr-name="`[${index}]`"
                            :attr-value="subitem"
                        />
                    </table>
                </template>
                <template v-else-if="isLink(props.attrValue)">
                    <LinkFragment
                        :href="props.attrValue.href"
                        :title="props.attrValue.title"
                        :type="props.attrValue.type"
                    />
                </template>
                <template v-else-if="isColor(props.attrValue)">
                    <ColorFragment :key="props.attrValue.getHexString()" :color="props.attrValue" />
                </template>
                <template v-else-if="isVector3(props.attrValue)">
                    <div class="d-flex align-items-center justify-content-between">
                        <CoordinateTuple :coordinates="props.attrValue" displayMode="cartesian" />
                    </div>
                </template>
                <template v-else><span class="text-secondary">Object</span></template>
            </template>
            <template v-else
                ><span :title="props.attrValue as string">{{ props.attrValue }}</span></template
            >
        </div>
    </div>
</template>

<style scoped>
    .attribute-row:hover {
        background-color: rgba(var(--bs-primary-rgb), 0.1);
    }
    .attribute-row:active {
        background-color: rgba(var(--bs-primary-rgb), 0.2);
    }
</style>

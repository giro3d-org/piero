<script setup lang="ts">
    import { isColor, isLink, isVector3 } from '@/utils/Types';
    import ColorFragment from './ColorFragment.vue';
    import CoordinateFragment from './CoordinateFragment.vue';
    import LinkFragment from './LinkFragment.vue';

    const props = defineProps<{
        attrName: string;
        attrValue: unknown;
    }>();

    let styles: string[];

    switch (props.attrName) {
        case 'IFCType':
            styles = ['badge', 'bg-secondary', 'text-light', 'text-truncate'];
            break;
        default:
            styles = ['text-truncate'];
    }
</script>

<template>
    <tr>
        <th :title="attrName" class="align-top text-truncate">{{ attrName }}</th>
        <td :class="styles">
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
                        <CoordinateFragment :value="props.attrValue.x.toFixed(0)" prefix="X:" />
                        <CoordinateFragment :value="props.attrValue.y.toFixed(0)" prefix="Y:" />
                        <CoordinateFragment
                            :value="props.attrValue.z.toFixed(0)"
                            prefix="Alt.:"
                            suffix="m"
                        />
                    </div>
                </template>
                <template v-else><span class="text-secondary">Object</span></template>
            </template>
            <template v-else
                ><span :title="props.attrValue as string">{{ props.attrValue }}</span></template
            >
        </td>
    </tr>
</template>

<style scoped>
    th {
        max-width: 150px;
    }
    td {
        word-wrap: break-word;
        max-width: 200px;
    }
</style>

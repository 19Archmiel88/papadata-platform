/** Analytic/navigation context only. Tokens, auth state and arbitrary query keys never cross modules. */
export const productScopeKeys = [
    'from', 'to', 'timezone', 'compare', 'channel', 'device', 'country', 'currency', 'sourceId', 'campaignId',
    'conversationId', 'caseThreadId',
] as const;
export const productContextKeys = [
    ...productScopeKeys, 'campaignView', 'campaignSearch', 'campaignSort', 'campaignDirection', 'campaignDetail',
    'attributionModel', 'attributionWindow', 'attributionLeft', 'attributionRight',
    'creativeId', 'creativeSearch', 'creativeFormat', 'creativeSample', 'creativePage', 'creativeLayout', 'creativeCompare', 'creativeSort', 'creativeDirection',
    'budgetCampaign', 'budgetPlanId', 'orderView', 'orderSource', 'orderQueue',
    'orderId', 'orderSearch', 'orderSort', 'orderDirection', 'refundId',
    'productId', 'productSearch', 'productSort', 'productDirection', 'inventoryAsOf', 'overviewMetric',
    'productView', 'productCategory', 'productFilter', 'productSegment',
    'customerId', 'segment', 'risk', 'customerView', 'customerSegment', 'customerRisk', 'customerSearch', 'customerSort', 'customerDirection', 'customerCursor',
    'customerCohort', 'cohortCompare', 'cohortPeriod', 'cohortSample', 'cohortComplete',
    'trafficView', 'trafficSearch', 'trafficSort', 'trafficDirection', 'trafficDetail', 'trafficId', 'trafficEvent', 'comparisonCurrency',
    'decisionId', 'decisionView', 'decisionSearch', 'decisionOwner', 'decisionDomain', 'decisionFilter', 'decisionSort',
    'reportId', 'reportVersion', 'reportMode', 'reportCollection', 'reportSearch',
    'helpSearch', 'helpCategory', 'procedure', 'ticketId', 'ticketPage', 'ticketSearch', 'ticketStatus',
] as const;
export function cleanProductContextPath(value: unknown): string | null {
    if (typeof value !== 'string' || value.length > 6000 || !/^\/app(?:[/?#]|$)/.test(value) || /[\x00-\x1f]/.test(value))
        return null;
    try {
        const url = new URL(value, 'https://context.invalid');
        if (url.origin !== 'https://context.invalid' || !/^\/app(?:\/|$)/.test(url.pathname))
            return null;
        const result = new URL(url.pathname, url.origin);
        for (const key of productContextKeys) {
            const item = url.searchParams.get(key);
            if (item && item.length <= 500 && !/[\x00-\x1f]/.test(item))
                result.searchParams.set(key, item);
        }
        const path = result.pathname + result.search;
        return path.length <= 4000 ? path : null;
    }
    catch {
        return null;
    }
}
export function productContextFilters(params: URLSearchParams): Record<string, string> {
    return Object.fromEntries(productContextKeys.flatMap(key => {
        const value = params.get(key);
        return value && value.length <= 500 && !/[\x00-\x1f]/.test(value) ? [[key, value]] : [];
    }));
}

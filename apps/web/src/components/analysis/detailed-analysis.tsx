import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import type { Rule, PlaceProfile } from '@/types/models';

type Props = {
  rules: Rule[];
  rawProfile: PlaceProfile;
};

type FieldData = {
  label: string;
  value?: string | string[];
  isArray?: boolean;
  missing?: boolean;
  isNA?: boolean;
};

export function DetailedAnalysis({ rules, rawProfile }: Props) {
  const detailedData = useMemo(
    () =>
      rules.map((rule) => {
        let fields: FieldData[] = [];

        if (!rule.applicable) {
          fields = [{ label: 'Not applicable for this type of business.', isNA: true }];
        } else {
          switch (rule.id) {
            case 'completeness':
              fields = [
                { label: 'Website', value: rawProfile?.websiteUri || 'Not provided', missing: !rawProfile?.websiteUri },
                {
                  label: 'Phone',
                  value: rawProfile?.internationalPhoneNumber || 'Not provided',
                  missing: !rawProfile?.internationalPhoneNumber,
                },
                {
                  label: 'Address',
                  value: rawProfile?.formattedAddress || 'Not provided',
                  missing: !rawProfile?.formattedAddress,
                },
              ];
              break;
            case 'rating':
              fields = [
                {
                  label: 'Average Rating',
                  value: rawProfile?.rating ? `${rawProfile.rating} stars` : 'Not provided',
                  missing: (rawProfile?.rating || 0) < 4.0,
                },
                {
                  label: 'Review Count',
                  value: rawProfile?.userRatingCount ? `${rawProfile.userRatingCount} reviews` : 'Not provided',
                  missing: (rawProfile?.userRatingCount || 0) < 10,
                },
              ];
              break;
            case 'business-category':
              fields = [
                {
                  label: 'Primary Categories',
                  value: (rawProfile?.types || []).map((t) =>
                    t
                      .split('_')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' '),
                  ),
                  isArray: true,
                  missing: !(rawProfile?.types?.length > 0),
                },
              ];
              break;
            case 'opening-hours':
              fields = [
                {
                  label: 'Operating Hours',
                  value: rawProfile?.regularOpeningHours?.periods ? 'Available' : 'Not provided',
                  missing: !rawProfile?.regularOpeningHours?.periods,
                },
              ];
              break;
            case 'business-status': {
              const statusStr = rawProfile?.businessStatus || 'Not provided';
              const formattedStatus =
                statusStr === 'Not provided'
                  ? statusStr
                  : statusStr
                      .split('_')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                      .join(' ');
              fields = [
                {
                  label: 'Current Status',
                  value: formattedStatus,
                  missing: rawProfile?.businessStatus !== 'OPERATIONAL',
                },
              ];
              break;
            }
            case 'photos':
              fields = [
                {
                  label: 'Photo Count',
                  value: rawProfile?.photoCount > 0 ? `${rawProfile.photoCount} photos` : 'Not provided',
                  missing: (rawProfile?.photoCount || 0) < 3,
                },
              ];
              break;
            case 'attributes':
              if (
                rawProfile?.delivery === undefined &&
                rawProfile?.dineIn === undefined &&
                rawProfile?.takeout === undefined &&
                rawProfile?.wheelchairAccessibleEntrance === undefined
              ) {
                fields = [{ label: 'No specific attributes extracted.', isNA: true }];
              } else {
                if (rawProfile?.delivery !== undefined)
                  fields.push({
                    label: 'Delivery',
                    value: rawProfile.delivery ? 'Yes' : 'No',
                    missing: !rawProfile.delivery,
                  });
                if (rawProfile?.dineIn !== undefined)
                  fields.push({
                    label: 'Dine-in',
                    value: rawProfile.dineIn ? 'Yes' : 'No',
                    missing: !rawProfile.dineIn,
                  });
                if (rawProfile?.takeout !== undefined)
                  fields.push({
                    label: 'Takeout',
                    value: rawProfile.takeout ? 'Yes' : 'No',
                    missing: !rawProfile.takeout,
                  });
                if (rawProfile?.wheelchairAccessibleEntrance !== undefined)
                  fields.push({
                    label: 'Wheelchair Accessible',
                    value: rawProfile.wheelchairAccessibleEntrance ? 'Yes' : 'No',
                    missing: !rawProfile.wheelchairAccessibleEntrance,
                  });
              }
              break;
            default:
              fields = [];
          }
        }

        return {
          ...rule,
          fields,
        };
      }),
    [rules, rawProfile],
  );

  return (
    <div className="bg-[#F5F5F5] border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
      <div className="px-6 py-4 border-b border-gray-200 bg-[#F5F5F5]">
        <h3 className="text-lg font-medium text-gray-900">Detailed Data Analysis</h3>
      </div>
      <div className="flex flex-col divide-y divide-gray-200">
        {detailedData.map((rule) => {
          let badgeColor = 'bg-gray-100 text-gray-500 border-gray-200';
          if (rule.applicable) {
            const pct = rule.max > 0 ? rule.earned / rule.max : 0;
            if (pct >= 0.8) badgeColor = 'bg-green-50 text-green-700 border-green-200';
            else if (pct > 0) badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
            else badgeColor = 'bg-red-50 text-red-700 border-red-200';
          }

          return (
            <div key={rule.id} className={cn('p-6', !rule.applicable && 'opacity-60')}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-foreground">{rule.name}</h4>
                  <HelpTooltip
                    icon="alert"
                    content={<div className="text-sm text-muted-foreground">{rule.description}</div>}
                    contentClassName="max-w-xs p-3"
                  />
                </div>
                <span
                  className={cn('px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border', badgeColor)}
                >
                  {!rule.applicable ? 'N/A' : `${rule.earned} / ${rule.max}`}
                </span>
              </div>
              <div className="space-y-4">
                {rule.fields.map((f, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 sm:gap-4"
                  >
                    {f.isNA ? (
                      <span className="text-sm text-muted-foreground italic">{f.label}</span>
                    ) : (
                      <>
                        <span className="text-sm text-muted-foreground shrink-0">{f.label}</span>
                        {f.isArray ? (
                          <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                            {((f.value as string[]) || []).map((v: string, vi: number) => (
                              <span
                                key={vi}
                                className="px-2.5 py-1 bg-background border border-border rounded-md text-sm text-foreground"
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span
                            className={cn(
                              'text-sm font-medium sm:text-right wrap-break-word',
                              f.missing ? 'text-destructive' : 'text-foreground',
                            )}
                          >
                            {f.value as string}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

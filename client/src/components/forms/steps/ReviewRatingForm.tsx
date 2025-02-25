'use client';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { RatingIndicator } from '../../common/RatingIndicator';

export function ReviewRatingForm() {
    const form = useFormContext();

    return (
        <div className="grid gap-4 py-4">
            <div>
                <FormField
                    control={form.control}
                    name="reviewRatingsStep.overallScore"
                    render={({ field: { onChange, value } }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Overall</FormLabel>
                            <RatingIndicator
                                value={value}
                                onChange={onChange}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div>
                <FormField
                    control={form.control}
                    name="reviewRatingsStep.easyScore"
                    render={({ field: { onChange, value } }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Easiness</FormLabel>
                            <RatingIndicator
                                value={value}
                                onChange={onChange}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div>
                <FormField
                    control={form.control}
                    name="reviewRatingsStep.interestScore"
                    render={({ field: { onChange, value } }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Interest</FormLabel>
                            <RatingIndicator
                                value={value}
                                onChange={onChange}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div>
                <FormField
                    control={form.control}
                    name="reviewRatingsStep.usefulScore"
                    render={({ field: { onChange, value } }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Usefulness</FormLabel>
                            <RatingIndicator
                                value={value}
                                onChange={onChange}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}

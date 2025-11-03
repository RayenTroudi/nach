import { connectUserToStripe } from "@/lib/actions/user.action";
import { TUser } from "@/types/models.types";
import { currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest, res: NextResponse) {
  const { user }: { user: TUser } = await req.json();

  try {
    const clerkUser = await currentUser();
    if (!clerkUser || !user) return new NextResponse("User not authenticated");

    const account = await stripe.accounts.create({
      country: "US",
      type: "custom",
      business_type: "company",
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
      external_account: "btok_us",
      tos_acceptance: {
        date: 1547923073,
        ip: "172.18.80.19",
      },
    });

    if (account) {
      const approve = await stripe.accounts.update(account.id, {
        business_profile: {
          mcc: "5045",
          url: "https://bestcookieco.com",
        },
        company: {
          address: {
            city: "Fairfax",
            line1: "123 State St",
            postal_code: "22031",
            state: "VA",
          },
          tax_id: "000000000",
          name: `${user.firstName} ${user.lastName}`,
          phone: "8888675309",
        },
      });
      if (approve) {
        const person = await stripe.accounts.createPerson(account.id, {
          first_name: user.firstName,
          last_name: user.lastName,
          relationship: {
            representative: true,
            title: "CEO",
          },
        });
        if (person) {
          const approvePerson = await stripe.accounts.updatePerson(
            account.id,
            person.id,
            {
              address: {
                city: "victoria ",
                line1: "123 State St",
                postal_code: "V8P 1A1",
                state: "BC",
              },
              dob: {
                day: 10,
                month: 11,
                year: 1980,
              },
              ssn_last_4: "0000",
              phone: "8888675309",
              email: "jenny@bestcookieco.com",
              relationship: {
                executive: true,
              },
            }
          );
          if (approvePerson) {
            const owner = await stripe.accounts.createPerson(account.id, {
              first_name: user.firstName,
              last_name: user.lastName,
              email: "kathleen@bestcookieco.com",
              address: {
                city: "victoria ",
                line1: "123 State St",
                postal_code: "V8P 1A1",
                state: "BC",
              },
              dob: {
                day: 10,
                month: 11,
                year: 1980,
              },
              phone: "8888675309",
              relationship: {
                owner: true,
                percent_ownership: 80,
              },
            });
            if (owner) {
              const complete = await stripe.accounts.update(account.id, {
                company: {
                  owners_provided: true,
                },
              });
              if (complete) {
                const saveAccountId = await connectUserToStripe({
                  stripeId: account.id,
                  userId: user._id,
                });

                if (saveAccountId) {
                  const accountLink = await stripe.accountLinks.create({
                    account: account.id,
                    refresh_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/teacher/withdraw`,
                    return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/teacher/withdraw`,
                    type: "account_onboarding",
                    collection_options: {
                      fields: "currently_due",
                    },
                  });
                  return NextResponse.json({
                    status: "success",
                    message: "Stripe account created successfully",
                    data: {
                      url: accountLink.url,
                    },
                  });
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(
      "An error occurred when calling the Stripe API to create an account:",
      error
    );
    return NextResponse.json({
      status: "error",
      message:
        "An error occurred when calling the Stripe API to create an account",
    });
  }
}

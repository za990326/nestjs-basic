/*
  Warnings:

  - You are about to drop the `booking_attendees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bookings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `meeting_rooms` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `booking_attendees` DROP FOREIGN KEY `Booking_Attendees_booking_id_fkey`;

-- DropForeignKey
ALTER TABLE `booking_attendees` DROP FOREIGN KEY `Booking_Attendees_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `Bookings_room_id_fkey`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `Bookings_user_id_fkey`;

-- DropTable
DROP TABLE `booking_attendees`;

-- DropTable
DROP TABLE `bookings`;

-- DropTable
DROP TABLE `meeting_rooms`;

-- CreateIndex
CREATE UNIQUE INDEX `Users_email_key` ON `Users`(`email`);

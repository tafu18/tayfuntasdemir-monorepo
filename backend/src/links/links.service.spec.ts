import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LinksService } from './links.service';
import { ShortLink } from './entities/ShortLink.entity';
import { MailService } from '../mail/mail.service';

describe('LinksService', () => {
  let service: LinksService;
  let repository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({
        id: 'uuid-1',
        tiklanma: 0,
        aktif: true,
        baslik: null,
        ownerId: null,
        ownerEmail: null,
        sonTiklanma: null,
        sonKullanma: null,
        olusturulma: new Date('2026-01-01T00:00:00Z'),
        ...data,
      })),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: getRepositoryToken(ShortLink),
          useValue: repository,
        },
        {
          provide: MailService,
          useValue: { sendMail: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('jwt-token') },
        },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
  });

  it('creates a short link with a random 6-char code', async () => {
    repository.findOne.mockResolvedValue(null);

    const created = await service.create({
      hedefUrl: 'https://example.com',
      ownerId: 'owner-1',
    });

    expect(created.hedefUrl).toBe('https://example.com');
    expect(created.kod).toHaveLength(6);
    expect(created.ownerId).toBe('owner-1');
  });

  it('throws ConflictException when custom code already exists', async () => {
    repository.findOne.mockResolvedValue({ id: '1', kod: 'taken' });

    await expect(
      service.create({ hedefUrl: 'https://example.com', customCode: 'taken' }),
    ).rejects.toThrow(ConflictException);
  });

  it('returns all links for admin and only owned links for regular visitors', async () => {
    repository.find.mockResolvedValue([{ id: '1' }]);

    await service.findAllForActor({ isAdmin: true });
    expect(repository.find).toHaveBeenLastCalledWith({ order: { olusturulma: 'DESC' } });

    await service.findAllForActor({ isAdmin: false, ownerId: 'owner-1' });
    expect(repository.find).toHaveBeenLastCalledWith({
      where: { ownerId: 'owner-1' },
      order: { olusturulma: 'DESC' },
    });

    expect(await service.findAllForActor({ isAdmin: false })).toEqual([]);
  });

  it('enforces ownership on remove unless admin', async () => {
    repository.findOne.mockResolvedValueOnce({ id: 'uuid-1', ownerId: 'owner-1', ownerEmail: null });
    await expect(
      service.remove('uuid-1', { isAdmin: false, ownerId: 'other-owner' }),
    ).rejects.toThrow(ForbiddenException);

    repository.findOne.mockResolvedValueOnce({ id: 'uuid-1', ownerId: 'owner-1', ownerEmail: null });
    await expect(service.remove('uuid-1', { isAdmin: true })).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith({ id: 'uuid-1' });

    repository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    await expect(service.remove('missing', { isAdmin: true })).rejects.toThrow(NotFoundException);
  });

  it('handles active, inactive, expired, and missing links on resolveClick', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    expect(await service.resolveClick('missing')).toEqual({ status: 'not_found' });

    repository.findOne.mockResolvedValueOnce({ id: '1', kod: 'paused', aktif: false });
    expect(await service.resolveClick('paused')).toEqual({ status: 'inactive' });

    repository.findOne.mockResolvedValueOnce({
      id: '2',
      kod: 'old',
      aktif: true,
      sonKullanma: new Date(Date.now() - 60_000),
    });
    expect(await service.resolveClick('old')).toEqual({ status: 'expired' });

    const entity = {
      id: '3',
      kod: 'abc123',
      hedefUrl: 'https://example.com',
      aktif: true,
      tiklanma: 2,
      sonKullanma: null,
    };
    repository.findOne.mockResolvedValueOnce(entity);
    const result = await service.resolveClick('abc123');
    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.link.tiklanma).toBe(3);
    }
  });
});

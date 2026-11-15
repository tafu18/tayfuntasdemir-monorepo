import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LinksService } from './links.service';
import { ShortLink } from './entities/ShortLink.entity';

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
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
  });

  it('creates a short link with a random 6-char code', async () => {
    repository.findOne.mockResolvedValue(null);

    const created = await service.create({ hedefUrl: 'https://example.com' });

    expect(created.hedefUrl).toBe('https://example.com');
    expect(created.kod).toHaveLength(6);
  });

  it('throws ConflictException when custom code already exists', async () => {
    repository.findOne.mockResolvedValue({ id: '1', kod: 'taken' });

    await expect(
      service.create({ hedefUrl: 'https://example.com', customCode: 'taken' }),
    ).rejects.toThrow(ConflictException);
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

  it('removes a link and throws NotFoundException when missing', async () => {
    repository.delete.mockResolvedValueOnce({ affected: 1 });
    await expect(service.remove('uuid-1')).resolves.toBeUndefined();

    repository.delete.mockResolvedValueOnce({ affected: 0 }).mockResolvedValueOnce({ affected: 0 });
    await expect(service.remove('unknown')).rejects.toThrow(NotFoundException);
  });
});
